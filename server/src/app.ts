import express, { Request, Response } from "express";
import querystring from "querystring";
import jwt from "jsonwebtoken";
import { get } from "lodash";
import cookieParser from "cookie-parser";
import axios from "axios";
import cors from "cors";
const { isAuth } = require('./isAuth.js');
const app = express();

app.use(cookieParser());

const GITHUB_CLIENT_ID = "15e3e7fac4fc4116da48";
const GITHUB_CLIENT_SECRET = "7a3586a1d2867c317466f7d886f3586e7d6c74f4";
const secret = "this is very secret phrase";


app.use(
  cors(
    {
    origin: "http://localhost:3000",
    credentials: true,
  })
);

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: string;
  email: null;
  hireable: null;
  bio: null;
  twitter_username: null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

async function getGitHubUser({ code }: { code: string }): Promise<GitHubUser> {
  // exchange code with access_token
  const githubToken = await axios
    .post(
      `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
    )
    .then((res) => res.data)

    .catch((error) => {
      throw error;
    });

  const decoded = querystring.parse(githubToken);
  // { access_token: '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', scope: 'user:email', token_type: 'bearer' }
  console.log('decoded', decoded);
  const accessToken = decoded.access_token;

  // get user info using access_token
  return axios
    .get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error getting user from GitHub`);
      throw error;
    });
}


app.get("/api/me", (req: Request, res: Response) => {
  try {
    const user = isAuth(req);
    console.log(user);
   if (!user) {
    return res.status(401).send({status: false, error: 'Unauthorized'});
   }
    return res.status(200).send({success: true, user: user});
  } catch (e) {
    return res.status(401).send({status: false, error: 'Unauthorized'});
  }
});


// callback url after signin
app.get("/api/auth/github", async (req: Request, res: Response) => {
  const code = get(req, "query.code");
  const path = get(req, "query.path", "/");

  if (!code) {
    throw new Error("No code!");
  }

  // exchange code with access_token
  const gitHubUser = await getGitHubUser({ code });

  console.log('gitHubUser', gitHubUser);

  const token = jwt.sign(gitHubUser, secret, { expiresIn: '30s' });

  res.redirect(`http://localhost:3000${path}?token=${token}`);
});

app.get('/api/protected', async (req, res) => {
  try {
    const user = isAuth(req);
    if (user) {
      res.send({
        data: 'This is protected data.',
      });
    }
  } catch (err) {
    res.status(401).send({
      error: err,
    });
  }
})


app.listen(4000, () => {
  console.log("Server is listening");
});
