import jwt from 'jsonwebtoken'

export function getUserFromRequest(req) {

  const auth =
    req.headers.get('authorization')

  console.log('AUTH =', auth)

  if (!auth) {
    return null
  }

  const token =
    auth.replace('Bearer ', '')

  console.log('TOKEN =', token)

  try {

    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    console.log('USER =', user)

    return user

  } catch (err) {

    console.log('JWT ERROR =', err)

    return null

  }
}