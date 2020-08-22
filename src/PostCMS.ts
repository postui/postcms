import { PostCMSAPI } from 'PostCMSAPI'
import { PostCMSBucket } from './PostCMSBucket'

const host = 'postcms.x-static.io'

export class PostCMS implements CMS {
    private _id: string
    private _api: API
    private _events: Map<string, Array<EventListener>>
    private _session: Session | null

    constructor(id: string) {
        this._id = id
        this._api = new PostCMSAPI(id + '.' + host)
        this._events = new Map()
        this._session = null
    }

    get api() {
        return this._api
    }

    get session() {
        return this._session
    }

    on(eventName: string, callback: EventListener) {
        if (this._events.has(eventName)) {
            this._events.set(eventName, [...this._events.get(eventName)!, callback])
        } else {
            this._events.set(eventName, [callback])
        }
    }

    off(eventName: string, callback?: EventListener) {
        if (this._events.has(eventName)) {
            if (callback) {
                const a = this._events.get(eventName)!
                a.splice(a.indexOf(callback), 1)
                if (a.length === 0) {
                    this._events.delete(eventName)
                }
            } else {
                this._events.delete(eventName)
            }
        }
    }

    async verifySession() {
        if (localStorage.getItem('postcms/session-token')) {
            const { token, user, error } = await this.api.query('session')
            if (error) {
                if (error.status === 401) {
                    this._updateSession(null, null)
                } else {
                    alert(error.message)
                }
            }
            this._updateSession(token, user)
            return { user }
        }
        return null
    }

    private _updateSession(token: string | null, user: User | null) {
        if (token && user) {
            this._session = { user }
            localStorage.addItem('postcms/session-token', token)
        } else {
            this._session = null
            localStorage.removeItem('postcms/session-token')
        }
        if (this._events.has('sessionupdate')) {
            this._events.get('sessionupdate')!.forEach(cb => cb(new Event('sessionupdate')))
        }
    }

    async login(id: string, password: string): Promise<{ user: User }> {
        const { token, user, error } = await this.api.mutation('login', { id, password })
        if (error) {
            throw error
        }
        this._updateSession(token, user)
        return { user }
    }

    async logout() {
        this._updateSession(null, null)
    }

    async getUsers(): Promise<User[]> {
        throw new Error('Method not implemented.')
    }

    async createUser(props: { password: string, email?: string, username?: string, pn?: string, profile?: Record<string, any> }): Promise<User> {
        const { token, user, error } = await this.api.mutation('create-user', props)
        if (error) {
            throw error
        }
        this._session = { user }
        localStorage.addItem('postcms/session-token', token)
        return user
    }

    // updateUser(uid: string, data: { password?: string | undefined; username?: string | undefined; email?: string | undefined; pn?: string | undefined; profile?: Record<string, any> | undefined }): Promise<User>
    // updateUser(data: { username?: string | undefined; email?: string | undefined; pn?: string | undefined; profile?: Record<string, any> | undefined }): Promise<User>
    updateUser(uid: any, data?: any): Promise<User> {
        throw new Error('Method not implemented.')
    }

    async updateUserPassword(oldPassword: string, newPassword: string): Promise<User> {
        throw new Error('Method not implemented.')
    }

    async forgetUserPassword(data: { email?: string | undefined; pn?: string | undefined }): Promise<void> {
        throw new Error('Method not implemented.')
    }

    bucket(name: string): Bucket {
        return new PostCMSBucket(this, name)
    }

    async createBucket(name: string, acl: BucketACL) {
        let aclN = acl.read === 'private' ? 0 : 1
        if (acl.write === 'member') {
            aclN += 1
        } else if (acl.write === 'public') {
            aclN += 2
        }
        const { bucket, error } = await this.api.mutation('create-bucket', { alias: name, acl: aclN })
        if (error) {
            throw error
        }
        return new PostCMSBucket(this, bucket.alias)
    }

    async deleteBucket(name: string) {
        const { error } = await this.api.mutation('create-bucket', { id: name })
        if (error) {
            throw error
        }
    }

    async updateBucketACL(name: string, acl: BucketACL) {
        let aclN = acl.read === 'private' ? 0 : 1
        if (acl.write === 'member') {
            aclN += 1
        } else if (acl.write === 'public') {
            aclN += 2
        }
        const { error } = await this.api.mutation('create-bucket', { id: name, acl: aclN })
        if (error) {
            throw error
        }
    }

    async uploadFile(file: File, path?: string, fc?: FetchController): Promise<SFSObject> {
        const { object, error } = await this.api.mutation('create-bucket', { file, path }, fc)
        if (error) {
            throw error
        }
        return object
    }
}
