# To-Do List

## 🔴 Critical Issues

### 1. Navbar Login Button Not Linked
**File:** `navbar.jsx`

```jsx
// Current - broken:
<a href='#'>Login</a>

// Should be:
<Link to='/login'>Login</Link>
```

### 2. Hero CTA Button Not Linked
**File:** `hero-section.jsx`

```jsx
// "Try It Now" button goes nowhere
<a href='#'>Try It Now</a>
```

### 3. CTA "View Docs" Button Placeholder
**File:** `cta.jsx`

## 🟡 Improvements Needed

### 4. Footer Has Placeholder Content
**File:** `footer.jsx`

- Logo links to `#`
- Footer links (About, Features, Works, Career) all `#`
- Social links all `#`
- Copyright says "shadcn/studio" - should be your brand

### 5. Banner Not Used
**File:** `landing.jsx`

`Banner` is imported but never rendered in the page.

### 6. Process Section Has Lorem Ipsum
**File:** `process.jsx`

Contains placeholder text that needs real content.

### 7. Error Page Route Missing
`error-page.jsx` exists but no route in App.jsx for 404 handling.

### 8. Navbar "Community" Link Invalid
Community section was removed but navbar still has `#community` link.

## ✅ Next Steps

| Priority | Task | Description |
|----------|------|-------------|
| 1️⃣ | Fix Navbar Links | Change Login button to use `<Link to="/login">` |
| 2️⃣ | Fix Hero CTA | Link "Try It Now" to `/signup` or `/login` |
| 3️⃣ | Update Footer | Replace all `#` links + update branding |
| 4️⃣ | Add 404 Route | Add catch-all route for NotFound page |
| 5️⃣ | Replace Placeholders | Update Process section content |
| 6️⃣ | Build Dashboard | Add real dashboard features |

## 📁 File Naming Inconsistencies
All files now use kebab-case ✅ (`signup.jsx`, `verify-email.jsx`, etc.)

---

**💡 TIP:** Quick Win - Fix the navbar Login button first; it's the most visible issue for users.