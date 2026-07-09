import { cp, mkdir, rm } from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const output = path.join(root, "public")

await rm(output, { recursive: true, force: true })
await mkdir(path.join(output, "console"), { recursive: true })
await cp(path.join(root, "index.html"), path.join(output, "index.html"))
await cp(path.join(root, "console", "out"), path.join(output, "console"), {
  recursive: true,
})

console.log("Built landing page at / and CEASER console at /console/.")
