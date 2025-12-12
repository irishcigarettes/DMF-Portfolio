import type {
  DatabaseObjectResponse,
  DataSourceObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import fs from "fs";
import path from "path";

import { notion } from "../src/lib/notion/client";

// Type for database property configurations
type DatabaseProperty = DataSourceObjectResponse["properties"][string];
type DatabaseProperties = Record<string, DatabaseProperty>;
type SavedSchemaFile = { props: DatabaseProperties };

/** Properly escape string for use in generated TypeScript code */
function escapeForTypeScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function isValidTypeScriptIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function toTypeScriptObjectKey(key: string): string {
  if (isValidTypeScriptIdentifier(key)) {
    return key;
  }

  return `"${escapeForTypeScript(key)}"`;
}

function getSchemaJsonPath(varName: string): string {
  return path.join(process.cwd(), "schemas", `${varName}Schema.json`);
}

function loadPropsFromDisk(varName: string): DatabaseProperties | null {
  const schemaPath = getSchemaJsonPath(varName);

  if (!fs.existsSync(schemaPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(schemaPath, "utf8");
    const parsed = JSON.parse(raw) as SavedSchemaFile;

    if (!parsed || typeof parsed !== "object" || !("props" in parsed)) {
      return null;
    }

    return parsed.props;
  } catch (err) {
    console.warn(`Failed to read schema cache for ${varName} at ${schemaPath}`, err);
    return null;
  }
}

/** Map Notion property types to Zod type strings. Extend as needed. */
function notionPropToZod(prop: DatabaseProperty): string {
  switch (prop.type) {
    case "title":
    case "rich_text":
    case "url":
    case "email":
    case "phone_number":
      return "z.string().optional()";
    case "checkbox":
      return "z.boolean().optional()";
    case "number":
      return "z.number().optional()";
    case "date":
      // Represent dates as ISO strings for now
      return "z.string().optional()";
    case "select": {
      const optionsArr = prop.select.options;
      if (optionsArr.length) {
        const options = optionsArr.map((o) => `"${escapeForTypeScript(o.name)}"`).join(", ");
        return `z.enum([${options}]).optional()`;
      }
      return "z.string().optional()";
    }
    case "multi_select": {
      const optionsArr = prop.multi_select.options;
      if (optionsArr.length) {
        const options = optionsArr.map((o) => `"${escapeForTypeScript(o.name)}"`).join(", ");
        return `z.array(z.enum([${options}])).optional()`;
      }
      return "z.array(z.string()).optional()";
    }
    case "status": {
      const optionsArr = prop.status.options;
      if (optionsArr.length) {
        const options = optionsArr.map((o) => `"${escapeForTypeScript(o.name)}"`).join(", ");
        return `z.enum([${options}]).optional()`;
      }
      return "z.string().optional()";
    }
    case "people":
      return "z.array(z.object({ id: z.string() })).optional()";
    case "files":
      return "z.array(z.any()).optional()";
    case "created_time":
    case "last_edited_time":
      return "z.string().optional()"; // ISO timestamp
    case "created_by":
    case "last_edited_by":
      return "z.object({ id: z.string() }).optional()";
    case "formula": {
      const expr = prop.formula.expression ?? "";
      // Heuristic: identify common patterns to guess result type
      const lower = expr.toLowerCase();
      if (lower.includes("formatdate") || lower.includes("format")) {
        return "z.string().optional()";
      }
      if (
        lower.includes("sum(") ||
        lower.includes("count(") ||
        lower.includes("number(") ||
        /[0-9+\-*/]/.test(lower)
      ) {
        return "z.number().optional()";
      }
      if (lower.includes("true") || lower.includes("false")) {
        return "z.boolean().optional()";
      }
      // Fallback when unsure
      return "z.any().optional()";
    }
    case "rollup":
      return "z.any().optional()";
    case "relation":
      return "z.array(z.object({ id: z.string() })).optional()";
    case "unique_id":
      return "z.object({ number: z.number(), prefix: z.string().nullable() }).optional()";
    default:
      // This ensures exhaustive checking at compile time
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _exhaustive: never = prop;
      return "z.any().optional()";
  }
}

type DatabaseConfig = {
  varName: string;
  id: string | undefined;
};

async function generateSchemas() {
  const databases: DatabaseConfig[] = [
    { varName: "Stack", id: process.env.NOTION_STACK_DATABASE_ID },
    { varName: "AMA", id: process.env.NOTION_AMA_DATABASE_ID },
    { varName: "Writing", id: process.env.NOTION_WRITING_DATABASE_ID },
    {
      varName: "DesignDetailsEpisodes",
      id: process.env.NOTION_DESIGN_DETAILS_EPISODES_DATABASE_ID,
    },
    { varName: "Music", id: process.env.NOTION_MUSIC_DATABASE_ID },
    { varName: "GoodWebsites", id: process.env.NOTION_GOOD_WEBSITES_DATABASE_ID },
    { varName: "Speaking", id: process.env.NOTION_SPEAKING_DATABASE_ID },
  ];

  const schemaLines: string[] = [
    "// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT MANUALLY",
    "// Run `bun run generate-schemas` to regenerate.\n",
    'import { z } from "zod";\n',
  ];

  fs.mkdirSync(path.join(process.cwd(), "schemas"), { recursive: true });

  for (const db of databases) {
    let props: DatabaseProperties | null = null;

    // Prefer live Notion schema when configured; otherwise fall back to committed JSON cache.
    if (db.id && process.env.NOTION_TOKEN) {
      try {
        // First retrieve the database to get the data source ID
        const database = (await notion.databases.retrieve({
          database_id: db.id,
        })) as DatabaseObjectResponse;

        const dataSourceId = database.data_sources[0]?.id;
        if (!dataSourceId) {
          console.warn(`No data source found for ${db.varName}; falling back to cached schema`);
        } else {
          // Then retrieve the data source to get properties
          const dataSource = (await notion.dataSources.retrieve({
            data_source_id: dataSourceId,
          })) as DataSourceObjectResponse;

          props = dataSource.properties;

          // Save/update cache on disk
          fs.writeFileSync(getSchemaJsonPath(db.varName), JSON.stringify({ props }, null, 2));
        }
      } catch (err) {
        console.warn(`Failed to fetch Notion schema for ${db.varName}; falling back to cached schema`, err);
      }
    }

    if (!props) {
      props = loadPropsFromDisk(db.varName);
    }

    if (!props) {
      console.warn(
        `No schema source available for ${db.varName} (missing env + missing cache). Generating an empty schema.`,
      );
      props = {};
    }

    const propLines: string[] = [];
    for (const [name, prop] of Object.entries(props)) {
      const key = toTypeScriptObjectKey(name);
      const zodType = notionPropToZod(prop);
      propLines.push(`  ${key}: ${zodType},`);
    }

    schemaLines.push(`export const ${db.varName}Schema = z.object({`);
    schemaLines.push(...propLines);
    schemaLines.push("});\n");
    schemaLines.push(`export type ${db.varName} = z.infer<typeof ${db.varName}Schema>;\n`);
  }

  const output = schemaLines.join("\n") + "\n";
  const outPath = path.join(process.cwd(), "schemas", "notionSchemas.ts");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output);

  // Run prettier on the generated file
  const { execSync } = await import("child_process");
  execSync(`bun run prettier --write "${outPath}"`, { stdio: "inherit" });

  console.log(`✅ Notion schemas generated at ${outPath}`);
}

if (require.main === module) {
  generateSchemas().catch((err) => {
    console.error("Failed to generate schemas", err);
    process.exit(1);
  });
}
