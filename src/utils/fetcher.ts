class HTTPError extends Error {
  public status: number

  public message: string

  constructor(status: number, message: string) {
    super()
    this.status = status
    this.message = message
  }
}

export async function jsonFetcher<T>(input: RequestInfo): Promise<T> {
  const response = await fetch(input)
  if (response.ok) {
    return response.json()
  }
  throw new HTTPError(response.status, response.statusText)
}
