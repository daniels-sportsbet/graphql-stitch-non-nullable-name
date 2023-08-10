import * as fs from "fs"
import * as path from "path"
import {
	buildSchema
} from "graphql"
import { stitchSchemas } from "@graphql-tools/stitch"
import { buildHTTPExecutor } from "@graphql-tools/executor-http"
import { SubschemaConfig } from "@graphql-tools/delegate"
import { makeExecutableSchema } from "@graphql-tools/schema"

export async function createLocalGraphQlSchema() {
	const externalServerSchema = await fs.readFileSync(path.join(__dirname, "externalServerSchema.graphql"), "utf8")

	const localSchema = makeExecutableSchema({
		typeDefs: `
			type Query {
				entityItem(id: ID!): Event
			}

			type Event {
				id: ID!
			}
		`,
		resolvers: {
			Query: {
				entityItem: (_root, {id}: {id: string}) => {
					return {
						id,
						__typename: "Event"
					}
				}
			}
		}
	})

	const externalServerSubschemaConfig: SubschemaConfig = {
		schema: buildSchema(externalServerSchema),
		executor: buildHTTPExecutor({
			endpoint: "http://127.0.0.1:4001"
		}),
		merge: {
			Event: {
				fieldName: "event",
				selectionSet: "{ id }",
				args: ({ id }) => ({ id })
			}
		}
	}

	return stitchSchemas({
		subschemas: [localSchema, externalServerSubschemaConfig]
	})
}
