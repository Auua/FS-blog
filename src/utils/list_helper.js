const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const result = blogs.sort(function(a,b) {
    return b.likes - a.likes
  })
  const fav =result[0]
  delete fav._id
  delete fav.url
  delete fav.__v
  return fav
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}