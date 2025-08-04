# Git Command Simulator

An interactive web application that visually simulates how Git works under the hood.  
Edit files, stage changes, commit with messages, switch branches, merge, and view commit diffs — all through realistic Git commands.

## 🔧 Features

- Type real Git commands like:
  - `git add filename`
  - `git commit -m "message"`
  - `git checkout branch`
  - `git branch name`
  - `git merge branch`
  - `git reset --hard HEAD~1`
  - `git revert commit-id`
- Live visualization of:
  - Working directory and staging area
  - Commit graph with branches and HEAD pointer
  - File diff between commits
- Editable file content directly in the UI
- Command history navigation using up/down arrow keys
- Error handling with in-app banners (no alerts)
- Auto-saves your simulated repo in localStorage

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/git-simulator.git
cd git-simulator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Example Commands to Try

```bash
git add app.js
git commit -m "feat: update app logic"
git branch feature/login
git checkout feature/login
git commit -m "feat: login form"
git checkout main
git merge feature/login
```

## 📁 Folder Structure

```
src/
  components/
    CommandInput.jsx
    RepoVisualization.jsx
    FileList.jsx
    BranchList.jsx
    CommitGraph.jsx
  App.jsx
  main.jsx
  styles.css
```

## 💡 Educational Use Case

This project is ideal for:
- Teaching Git basics visually
- Understanding branching and merge strategies
- Reinforcing how Git stores file snapshots per commit

## 🛠 Tech Stack

- React + Vite
- Tailwind CSS (optional)
- LocalStorage for persistence
- Vanilla JS for logic (no backend required)

## 📦 Deployment

You can deploy this project on:
- **Vercel**: auto-detects Vite and deploys with 1 click
- **GitHub Pages**:
  1. Run `npm run build`
  2. Deploy `dist/` folder using `gh-pages` or your tool of choice


Built for learning. Not a replacement for actual Git — but a pretty smart simulator.
