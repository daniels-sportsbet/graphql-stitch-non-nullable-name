import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { createLocalGraphQlSchema } from "./createLocalGraphQlSchema"

(async function () {
	const { url } = await startStandaloneServer(
		new ApolloServer({
			schema: await createLocalGraphQlSchema()
		}),
		{
			listen: { port: 4000 }
		}
	)

	console.log(`🚀 Local server ready at ${url}`)
})()
