import bcrypt from 'bcrypt'

export const hash = (password) => {
  const saltrounds = parseInt(process.env.BCRYPT_SALT_ROUNDS_FOR_PASSWORD)
  console.log(saltrounds)
  return bcrypt.hash(password, saltrounds)
}

export const compare = (passwordFromPayload, passwordInDB) => {
  return bcrypt.compare(passwordFromPayload, passwordInDB)
}
