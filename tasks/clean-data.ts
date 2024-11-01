import { task } from 'hardhat/config'
import fs from 'fs'
import path from 'path'

task('data:clean', 'Cleans our input image data')
  .addParam('src', 'The folder with the input', './data/src-assets/Combined')
  .setAction(async ({ src }, hre) => {
    // Create output directories if they don't exist
    const outputDirs = ['data/dist/negative', 'data/dist/positive'].map(dir => {
      const dirPath = path.join(process.cwd(), dir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      return dirPath
    })

    // Read all files in source directory
    const files = fs.readdirSync(src)

    // Initialize tokens metadata
    const tokens = {}

    // Process files
    files.forEach(file => {
      // Skip non-jpg files
      if (!file.endsWith('.jpg')) return

      // Extract ID and name using regex
      const match = file.match(/^(\d+)[\s_](.+?)(?:-2)?\.jpg$/)
      if (!match) {
        console.warn(`Warning: Could not parse filename: ${file}`)
        return
      }

      const [_, rawId, name] = match
      const id = parseInt(rawId)

      // Store token metadata if not already stored
      if (!tokens[id]) {
        tokens[id] = name.replace(/-2$/, '').replace('_', '\'').trim()
      }

      // Determine if this is a positive or negative image
      const isNegative = file.endsWith('-2.jpg')
      const targetDir = outputDirs[isNegative ? 0 : 1]

      // Copy file to appropriate directory with new name
      fs.copyFileSync(
        path.join(src, file),
        path.join(targetDir, `${id}.jpg`)
      )
    })

    // Write tokens metadata to JSON file
    fs.writeFileSync(
      path.join(process.cwd(), 'data/tokens.json'),
      JSON.stringify(tokens, null, 4)
    )

    console.log('Processing complete:')
    console.log(`- Processed ${Object.keys(tokens).length} token pairs`)
    console.log('- Created negative/ and positive/ directories')
    console.log('- Generated tokens.json with metadata')
  })
