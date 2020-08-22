export class PostCMSAPI implements API {
    private _host: string

    constructor(host: string) {
        this._host = host
    }

    async query(endpoint: string, params?: Record<string, any>, fc?: FetchController) {
        let url = `https://${this._host}/${endpoint}`
        const search: string[] = []
        if (params) {
            for (const key in params) {
                const value = params[key]
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    search.push(`${key}=${encodeURIComponent(value)}`)
                } else if (typeof value === 'object' && (Array.isArray(value) || value !== null)) {
                    if (Array.isArray(value)) {
                        search.push(`${key}=${encodeURIComponent(value.join(','))}`)
                    } else if (value !== null) {
                        search.push(`${key}=${encodeURIComponent(JSON.stringify(value))}`)
                    }
                }
            }
        }
        if (search.length > 0) {
            url += '?' + search.join('&')
        }
        const headers = new Headers()
        const token = localStorage.getItem('postcms/session-token')
        if (token) {
            headers.append('X-Session', token)
        }
        return await fetch(url, { method: 'GET', headers, signal: fc?.signal }).then(resp => resp.json())
    }

    async mutation(endpoint: string, data?: Record<string, any>, fc?: FetchController) {
        const url = `https://${this._host}/${endpoint}`
        const headers = new Headers()
        const token = localStorage.getItem('postcms/session-token')
        if (token) {
            headers.append('X-Session', token)
        }
        const body = new FormData()
        if (data) {
            for (const key in data) {
                const value = data[key]
                if (typeof value === 'string') {
                    body.append(key, value)
                } else if (typeof value === 'number' || typeof value === 'boolean') {
                    body.append(key, value.toString())
                } else if (value instanceof File) {
                    body.append(key, value, value.name)
                } else if (value instanceof Blob) {
                    body.append(key, value)
                } else if (typeof value === 'object' && (Array.isArray(value) || value !== null)) {
                    body.append(key, JSON.stringify(value))
                }
            }
        }
        return await fetch(url, { method: 'POST', headers, body, signal: fc?.signal }).then(resp => resp.json())
    }
}
