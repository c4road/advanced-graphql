const resolvers = require('../src/resolvers')

describe('resolvers', () => {
    test('feed', () => {
        const results = resolvers.Query.feed(null, null, {
            models: {
                Post: {
                    findMany() {
                        return ['Hello']
                    }
                }
            }
        })
        expect(results).toEqual(['Hello'])
    })
})