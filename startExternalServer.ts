import * as fs from "fs"
import * as path from "path"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { makeExecutableSchema } from "@graphql-tools/schema"

const events = [
	{ id: "3", name: "Event 3" },
	{ id: "4", name: "Event 4" },
];

(async function () {
	const externalServerSchema = await fs.readFileSync(path.join(__dirname, "externalServerSchema.graphql"), "utf8")
	const { url } = await startStandaloneServer(
		new ApolloServer({
			schema:  makeExecutableSchema({
				typeDefs: externalServerSchema,
				resolvers: {
				  Query: {
					event: (_root, { id }) => events.find(e => e.id === id) || null
				  }
				}
			  })
		}),
		{
			listen: { port: 4001 }
		}
	)

	console.log(`🚀 External server ready at ${url}`)
})()
