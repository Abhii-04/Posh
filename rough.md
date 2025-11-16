const { createServerClient, parseCookieHeader, serializeCookieHeader } = require('@supabase/ssr')

exports.createClient = (context) => {
  return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.req.headers.cookie ?? '')
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          context.res.appendHeader('Set-Cookie', serializeCookieHeader(name, value))
        )
      },
    },
  })
}


//ROUTE
const express = require("express")
const dotenv = require("dotenv")

const { createClient } = require("./lib/supabase")

const app = express()

app.post("/hello-world", async function (req, res, next) {
  const { email, emailConfirm } = req.body
  ...

  const supabase = createClient({ req, res })
})