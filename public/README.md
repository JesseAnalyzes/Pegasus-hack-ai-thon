# Public Assets

This folder contains static assets that are served by Next.js.

## Files

- **nimbus_logo.png** - The Nimbus logo displayed in the sidebar

## Usage

Files in this folder can be referenced in the application using the root path `/`:

```tsx
<Image src="/nimbus_logo.png" alt="Nimbus Logo" width={180} height={80} />
```

## Adding New Assets

To add new static assets (images, fonts, etc.):
1. Place the file in this `public` folder
2. Reference it in your code with a leading slash: `/filename.ext`
3. Next.js will serve it from the root of your domain

## Notes

- All files in this folder are publicly accessible
- Don't put sensitive files here
- Next.js automatically optimizes images when using the `next/image` component

