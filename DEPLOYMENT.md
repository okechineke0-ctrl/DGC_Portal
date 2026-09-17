# Hosting on Render (Step-by-Step Guide)

Follow these simple steps to deploy your **Dominion Stars Global College Management Portal** to Render for free.

---

### Step 1: Export Your Project
1. In Google AI Studio, click on the **Settings / Menu** icon in the top header.
2. Select **Export to GitHub** (recommended) or **Download as ZIP**.
   - If using GitHub, choose your repository name and push the code.
   - If downloading as ZIP, unzip it and push it to a new GitHub repository using Git:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
     git push -u origin main
     ```

---

### Step 2: Create a Web Service on Render
1. Go to [https://render.com](https://render.com) and sign in (or create a free account).
2. On your Render dashboard, click the **New +** button and select **Web Service**.
3. Choose **Build and deploy from a Git repository**, click **Next**, and connect your GitHub account.
4. Select the repository you just created/exported.

---

### Step 3: Configure Service Settings
Fill in the following fields on the Render configuration page:

| Setting | Value |
| :--- | :--- |
| **Name** | `dominion-stars-portal` (or your preferred name) |
| **Language / Runtime** | `Node` |
| **Branch** | `main` |
| **Region** | Choose the closest region (e.g., Frankfurt, Oregon, Singapore) |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

---

### Step 4: Configure Environment Variables
Under the **Environment Variables** section, add the following:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables optimized production mode |
| `PORT` | `3000` | Tells Render to route traffic to port 3000 |

*(Optional)* If you do not want to commit `firebase-applet-config.json` to GitHub, you can add an environment variable named `FIREBASE_CONFIG` containing the full JSON content of `firebase-applet-config.json`.

---

### Step 5: Deploy!
1. Click **Deploy Web Service** at the bottom of the page.
2. Render will run `npm install`, compile the Vite client and Node server bundle via `npm run build`, and launch the app using `node dist/server.cjs`.
3. Once the build finishes, your site will be live at:
   `https://dominion-stars-portal.onrender.com` (or your custom service URL)!
