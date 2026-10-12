import type { CodegenConfig } from "@graphql-codegen/cli";

// Types come from the server's exported schema, so frontend and backend cannot drift apart.
// Run `npm run schema` after the API changes.
const config: CodegenConfig = {
  schema: "schema.graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**/*"],
  ignoreNoDocuments: true,
  generates: {
    "src/gql/": {
      preset: "client",
      config: {
        documentMode: "string",
        enumsAsTypes: true,
        useTypeImports: true,
        scalars: {
          Date: "string",
          DateTime: "string",
          Decimal: "string",
          JSON: "Record<string, unknown>",
          Kobo: "number",
        },
      },
      presetConfig: { fragmentMasking: false },
    },
  },
};

export default config;
