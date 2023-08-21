import * as fs from "fs"
import * as path from "path"
import {
	OperationTypeNode,
	buildSchema
} from "graphql"
import { stitchSchemas } from "@graphql-tools/stitch"
import { buildHTTPExecutor } from "@graphql-tools/executor-http"
import { SubschemaConfig, delegateToSchema } from "@graphql-tools/delegate"
import { makeExecutableSchema } from "@graphql-tools/schema"

const tests = [{
	id: "1",
	name: "AAA"
}, {
	id: "2",
	name: "BBB"
}, {
	id: "3",
	name: "CCC"
}, {
	id: "4",
	name: "DDD"
}]

export async function createLocalGraphQlSchema() {
	const externalServerSchema = buildSchema(await fs.readFileSync(path.join(__dirname, "externalServerSchema.graphql"), "utf8"))

	const externalServerSubschemaConfig: SubschemaConfig = {
		schema: externalServerSchema,
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

	const localSchema = makeExecutableSchema({
		typeDefs: `
			type Query {
				test(id: ID!): Test
			}

			type Event {
				id: ID!
			}

			type Test {
				id: ID!
				name: String!
				event: Event
			}
		`,
		resolvers: {
			Query: {
				test: (_root, {id}: {id: string}) => tests.find(test => test.id === id) || null,
			},
			Test: {
				event: {
					resolve(_parent, __args, context, info) {
						return delegateToSchema({
						  schema: externalServerSubschemaConfig,
						  operation: OperationTypeNode.QUERY,
						  fieldName: "event",
						  context,
						  info,
						  args: {id: info.variableValues.id}
						});
					  }
				}
			}
		}
	})

	const localServerSubschemaConfig: SubschemaConfig = {
		schema: localSchema
	}

	return stitchSchemas({
		subschemas: [localServerSubschemaConfig, externalServerSubschemaConfig]
	})
}
