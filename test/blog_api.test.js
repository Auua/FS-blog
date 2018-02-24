const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../src/models/blog')
const { blogs, nonExistingId, blogsInDb } = require('./test_blogs')


beforeAll(async () => {
  await Blog.remove({})

  const blogObjects = blogs.map(n => new Blog(n))
  await Promise.all(blogObjects.map(n => n.save()))
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api
    .get('/api/blogs')

  expect(response.body.length).toBe(blogs.length)
})

test('the first blog is React patterns', async () => {
  const response = await api
    .get('/api/blogs')

  expect(response.body[0].title).toBe('React patterns')
})

describe('adding note', async () => {
  test('a valid blog can be added ', async () => {

    const newBlog = {
      title: 'New title',
      author: 'Author',
      url: 'http://test.url',
      likes: 5,
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await blogsInDb()

    const contents = blogsAfter.map(r => r.title + ' ' + r.author)

    expect(blogsAfter.length).toBe(blogsBefore.length+1)
    expect(contents).toContain(newBlog.title + ' ' + newBlog.author)

  })

  test('blog without title is not added ', async () => {
    const newBlog = {
      author: 'Author',
      url: 'http://test.url',
      likes: 5,
    }

    const intialBlogs= await api
      .get('/api/blogs')

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const response = await api
      .get('/api/blogs')

    //const contents = response.body.map(r => r.content)

    expect(response.body.length).toBe(intialBlogs.body.length)
  })

  test('a blog without likes can be added ', async () => {

    const newBlog = {
      title: 'New title',
      author: 'Author',
      url: 'http://test.url'
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await blogsInDb()

    const contents = blogsAfter.map(r => r.likes)

    expect(blogsAfter.length).toBe(blogsBefore.length+1)
    expect(contents).toContain(0)

  })
})

describe('deletion of a blog', async () => {
  let newBlog

  beforeAll(async () => {
    newBlog = new Blog({
      title: 'Delete',
      author: 'Someone_for_deletion',
      url: 'http://test.com',
      likes: 2,
    })
    await newBlog.save()
  })

  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsAtStart = await blogsInDb()

    await api
      .delete(`/api/blogs/${newBlog._id}`)
      .expect(204)

    const blogsAfterOperation = await blogsInDb()

    const contents = blogsAfterOperation.map(r => r.author)

    expect(contents).not.toContain(newBlog.author)
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
  })
})


afterAll(() => {
  server.close()
})