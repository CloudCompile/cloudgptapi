# Scripts

## fetch-models.js

Fetches the latest available models from Pollinations API.

### Usage

```bash
node scripts/fetch-models.js
```

### Environment Variables

- `POLLINATIONS_API_KEY` - Pollinations API key (optional, has default)

### Output

Creates `.models-cache/` directory with:
- `pollinations-text.json` - Pollinations text/chat models
- `pollinations-image.json` - Pollinations image/video models

### Example

```bash
# Fetch models
node scripts/fetch-models.js

# Review the output
cat .models-cache/pollinations-text.json | jq '.data[] | .id'
cat .models-cache/pollinations-image.json | jq '.[] | .name'

# Then manually update lib/providers.ts with the new models
```

## Notes

The sandbox environment has restricted network access, so this script needs to be run in an environment with internet access (like GitHub Actions or locally).
