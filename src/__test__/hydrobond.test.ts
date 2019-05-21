import Hydrobond, {
  Application,
  Authorization,
  File,
  PostBody,
  UserSettings
} from '../hydrobond'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('Application', (): void => {
  it('valid instance', (): void => {
    const application = new Application({ id: 1, name: 'name' })

    expect(application.id).toBe(1)
    expect(application.name).toBe('name')
  })
})

describe('Authorization', (): void => {
  it('valid instance', (): void => {
    const authorization = new Authorization({
      accessToken: 'accessToken',
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      stateText: 'stateText'
    })

    expect(authorization.accessToken).toBe('accessToken')
    expect(authorization.clientId).toBe('clientId')
    expect(authorization.clientSecret).toBe('clientSecret')
    expect(authorization.stateText).toBe('stateText')
    expect(authorization.tokenType).toBe('Bearer')
  })

  it('default', (): void => {
    const authorization = new Authorization({})

    expect(authorization.accessToken).toBe('')
    expect(authorization.clientId).toBe('')
    expect(authorization.clientSecret).toBe('')
    expect(authorization.stateText.length).toBeGreaterThan(0)
    expect(authorization.tokenType).toBe('Bearer')
  })
})

describe('Hydrobond', (): void => {
  const mock = new MockAdapter(axios)
  const hydrobond = new Hydrobond(
    new URL('https://example.com/api'),
    new URL('https://example.com/oauth'),
    {
      accessToken: 'access_token',
      clientId: 'client_id',
      clientSecret: 'client_secret',
      stateText: 'state',
      tokenType: 'Bearer'
    }
  )

  describe('getAuthorizeUrl', (): void => {
    it('throw error because of clientId is empty', (): void => {
      const hydrobond = new Hydrobond(
        new URL('https://example.com/api'),
        new URL('https://example.com/oauth'),
        {
          accessToken: 'access_token',
          clientSecret: 'client_secret',
          stateText: 'state',
          tokenType: 'Bearer'
        }
      )
      expect(
        (): void => {
          hydrobond.getAuthorizeUrl()
        }
      ).toThrowError(new Error('clientId is empty'))
    })

    it('success make authorize url', (): void => {
      const url = hydrobond.getAuthorizeUrl()

      expect(url).toBeInstanceOf(URL)
      expect(url.href).toBe(
        'https://example.com/oauth/authorize?client_id=client_id&response_type=code&state=state'
      )
    })
  })

  describe('authorize', (): void => {
    it('throw error because of clientId is not set', async (): Promise<
      void
    > => {
      const hydrobond = new Hydrobond(
        new URL('https://example.com/api'),
        new URL('https://example.com/oauth'),
        {
          accessToken: 'access_token',
          clientSecret: 'client_secret',
          stateText: 'state',
          tokenType: 'Bearer'
        }
      )

      try {
        await hydrobond.authorize('access_token')
      } catch (e) {
        expect(e).toEqual(new Error('clientId is empty'))
      }
    })

    it('throw error because of clientSecret is not set', async (): Promise<
      void
    > => {
      const hydrobond = new Hydrobond(
        new URL('https://example.com/api'),
        new URL('https://example.com/oauth'),
        {
          accessToken: 'access_token',
          clientId: 'cliend_id',
          stateText: 'state',
          tokenType: 'Bearer'
        }
      )

      try {
        await hydrobond.authorize('access_token')
      } catch (e) {
        expect(e).toEqual(new Error('clientSecret is empty'))
      }
    })

    it('success authroize application and return valid access token', async (): Promise<
      void
    > => {
      mock
        .onPost(
          'https://example.com/oauth/token?client_id=client_id&response_type=code&state=state',
          {
            /* eslint-disable @typescript-eslint/camelcase*/
            client_id: 'client_id',
            client_secret: 'client_secret',
            code: 'auth_code',
            grant_type: 'authorization_code',
            state: 'state'
            /* eslint-enable @typescript-eslint/camelcase*/
          }
        )
        .reply(200, {
          /* eslint-disable @typescript-eslint/camelcase*/
          access_token: 'access_token',
          token_type: 'Bearer'
          /* eslint-enable @typescript-eslint/camelcase*/
        })

      const res = await hydrobond.authorize('auth_code')

      expect(res).toBe('access_token')
    })
  })

  describe('post', (): void => {
    it('success post text', async (): Promise<void> => {
      const postBody = new PostBody({
        text: 'text'
      })
      const postResponse = {
        id: 1,
        text: 'text',
        user: {
          avatarFile: null,
          id: 1,
          name: 'user',
          screenName: 'user',
          postsCount: 1,
          createdAt: '1970-01-01T00:00:00.000Z',
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        application: {
          id: 1,
          name: 'hydrobond'
        },
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
        files: []
      }

      mock
        .onPost('/v1/posts', {
          text: 'text'
        })
        .reply(200, postResponse)

      const res = await hydrobond.post(postBody)

      expect(res.text).toBe('text')
    })

    it('success post with attachments', async (): Promise<void> => {
      const postBody = new PostBody({
        text: 'text',
        fileIds: [1, 2, 3]
      })
      const postResponse = {
        id: 1,
        text: 'text',
        user: {
          avatarFile: null,
          id: 1,
          name: 'user',
          screenName: 'user',
          postsCount: 1,
          createdAt: '1970-01-01T00:00:00.000Z',
          updatedAt: '1970-01-01T00:00:00.000Z'
        },
        application: {
          id: 1,
          name: 'hydrobond'
        },
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
        files: [
          {
            id: 1,
            name: '1st image',
            variants: [
              {
                id: 101,
                score: 100,
                extension: 'webp',
                type: 'image',
                size: 0,
                url: 'https://example.cpm/1/101/image.webp',
                mime: 'image/webp'
              }
            ]
          },
          {
            id: 2,
            name: '2nd image',
            variants: [
              {
                id: 102,
                score: 100,
                extension: 'webp',
                type: 'image',
                size: 0,
                url: 'https://example.cpm/2/102/image.webp',
                mime: 'image/webp'
              }
            ]
          },
          {
            id: 3,
            name: '3rd image',
            variants: [
              {
                id: 103,
                score: 100,
                extension: 'webp',
                type: 'image',
                size: 0,
                url: 'https://example.cpm/3/103/image.webp',
                mime: 'image/webp'
              }
            ]
          }
        ]
      }

      mock
        .onPost('/v1/posts', {
          text: 'text',
          fileIds: [1, 2, 3]
        })
        .reply(200, postResponse)

      const res = await hydrobond.post(postBody)

      expect(res.files).toHaveLength(3)
      expect(res.files[0].id).toBe(1)
      expect(res.files[1].id).toBe(2)
      expect(res.files[2].id).toBe(3)
    })
  })

  describe('getTimeline', (): void => {
    it('success get timeline', async (): Promise<void> => {
      const postResponse = [
        {
          id: 1,
          text: 'text',
          user: {
            avatarFile: null,
            id: 1,
            name: 'user',
            screenName: 'user',
            postsCount: 1,
            createdAt: '1970-01-01T00:00:00.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z'
          },
          application: {
            id: 1,
            name: 'hydrobond'
          },
          createdAt: '1970-01-01T00:00:00.000Z',
          updatedAt: '1970-01-01T00:00:00.000Z',
          files: []
        }
      ]

      mock
        .onGet('/v1/timelines/public', {
          count: 1,
          sinceId: 1,
          maxId: 1
        })
        .reply(200, postResponse)

      const res = await hydrobond.getTimeline(1, 1, 1)

      expect(res).toHaveLength(1)
      expect(res[0].id).toBe(1)
    })

    it('throw error because of count is greater than 100', async (): Promise<
      void
    > => {
      await expect(hydrobond.getTimeline(10000)).rejects.toThrowError(
        'count must be less than or equal to 100'
      )
    })

    it('throw error because of count is less than 1', async (): Promise<
      void
    > => {
      await expect(hydrobond.getTimeline(0)).rejects.toThrowError(
        'count must be greater than or equal to 1'
      )
    })
  })

  describe('updateAccount', (): void => {
    it('success update name and avatar', async (): Promise<void> => {
      const userSettings = new UserSettings({
        name: 'New name',
        avatarFileId: 1
      })
      const userResponse = {
        id: 1,
        name: 'New name',
        screenName: 'user',
        postsCount: 1,
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
        avatarFile: {
          id: 1,
          name: 'Avatar',
          variants: [
            {
              id: 101,
              score: 100,
              extension: 'webp',
              type: 'image',
              size: 0,
              url: 'https://example.cpm/1/101/image.webp',
              mime: 'image/webp'
            }
          ]
        }
      }

      mock
        .onPatch('/v1/account', {
          name: 'New name',
          avatarFileId: 1
        })
        .reply(200, userResponse)

      const res = await hydrobond.updateAccount(userSettings)

      expect(res.name).toBe('New name')
      expect(res.avatarFile).toBeInstanceOf(File)
      if (res.avatarFile instanceof File) expect(res.avatarFile.id).toBe(1)
    })

    it('success update only name', async (): Promise<void> => {
      const userSettings = new UserSettings({
        name: 'New name'
      })
      const userResponse = {
        id: 1,
        name: 'New name',
        screenName: 'user',
        postsCount: 1,
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
        avatarFile: null
      }

      mock
        .onPatch('/v1/account', {
          name: 'New name'
        })
        .reply(200, userResponse)

      const res = await hydrobond.updateAccount(userSettings)

      expect(res.name).toBe('New name')
      expect(res.avatarFile).toBeNull()
    })

    it('success update only avatar', async (): Promise<void> => {
      const userSettings = new UserSettings({
        avatarFileId: 1
      })
      const userResponse = {
        id: 1,
        name: 'Old name',
        screenName: 'user',
        postsCount: 1,
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
        avatarFile: {
          id: 1,
          name: 'Avatar',
          variants: [
            {
              id: 101,
              score: 100,
              extension: 'webp',
              type: 'image',
              size: 0,
              url: 'https://example.cpm/1/101/image.webp',
              mime: 'image/webp'
            }
          ]
        }
      }

      mock
        .onPatch('/v1/account', {
          avatarFileId: 1
        })
        .reply(200, userResponse)

      const res = await hydrobond.updateAccount(userSettings)

      expect(res.name).toBe('Old name')
      expect(res.avatarFile).toBeInstanceOf(File)
      if (res.avatarFile instanceof File) expect(res.avatarFile.id).toBe(1)
    })

    it('do not update anything', async (): Promise<void> => {
      const userSettings = new UserSettings({})
      const userResponse = {
        id: 1,
        name: 'Old name',
        screenName: 'user',
        postsCount: 1,
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
        avatarFile: null
      }

      mock.onPatch('/v1/account', {}).reply(200, userResponse)

      const res = await hydrobond.updateAccount(userSettings)

      expect(res.name).toBe('Old name')
      expect(res.avatarFile).toBeNull()
    })
  })
})
