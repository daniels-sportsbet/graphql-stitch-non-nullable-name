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
				test(id: ID!, name: String!): Test!
				entityItem(id: ID!, name: String!): Entity
			}
 
			type Test {
				id: ID!
				name: String!
				entity: Entity
			}

			union Entity = Class | Event

			type Class {
				id: ID!
			}

			type Event {
				id: ID!
			}
		`,
		resolvers: {
			Query: {
				test: (_root, {id, name}: {id: string, name: string}) => {
					return {
						id,
						name
					}
				},
				entityItem: (_root, {id, name}: {id: string, name: string}) => {
					return {
						id,
						__typename: name === "Class Name" ? "Class" : "Event"
					}
				}
			},
			Entity: {
				__resolveType({ __typename}: {__typename: "Class" | "Event"}) {
					if (!__typename) {
						throw new Error("No typename")
					}

					return __typename
				}
			},
			Test: {
				entity({ id, name }) {
					return {
						id,
						__typename: name === "Class Name" ? "Class" : "Event"
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
			Class: {
				fieldName: "class",
				selectionSet: "{ id }",
				args: ({ id }) => ({ id })
			},
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
