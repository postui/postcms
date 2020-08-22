export class PostCMSBucket implements Bucket {
    private _cms: CMS
    private _name: string

    constructor(cms: CMS, name: string) {
        this._cms = cms
        this._name = name
    }

    async getPosts(filter?: QueryPostsFilter, ac?: FetchController): Promise<Post[]> {
        const { error, posts } = await this._cms.api.query(`/${this._name}`, filter, ac)
        if (error) {
            throw error
        }
        return posts
    }

    async getPost(id: string, kv?: string[], ac?: FetchController): Promise<Post> {
        const { error, post } = await this._cms.api.query(`/${this._name}/${id}`, kv ? { kv } : undefined, ac)
        if (error) {
            throw error
        }
        return post
    }

    async createPost(data?: Partial<Omit<Post, 'id' | 'crtime' | 'modtime'>>): Promise<Post> {
        const { error, post } = await this._cms.api.mutation('create-post', data)
        if (error) {
            throw error
        }
        return post
    }

    async updatePost(id: string, data: Partial<Omit<Post, 'id' | 'crtime' | 'modtime'>>): Promise<void> {
        const { error } = await this._cms.api.mutation('update-post', { ...data, id })
        if (error) {
            throw error
        }
    }

    async deletePost(id: string): Promise<void> {
        const { error } = await this._cms.api.mutation('delete-post', { id })
        if (error) {
            throw error
        }
    }
}
