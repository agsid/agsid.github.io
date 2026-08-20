---
title: "Secure Login Portal"
summary: "A login page wired into Google Firebase for authentication and data storage — sign-in that actually persists."
tags: ["HTML", "CSS", "JavaScript", "Firebase"]
learned:
  - "Wiring a front end to a hosted auth provider instead of faking it"
  - "That storing users is the easy half — handling the failure states is the rest"
  - "Keeping API keys and config out of the parts of the page anyone can read"
url: "https://ag-sid.w3spaces.com/login.html"
color: "#4f46e5"
order: 6
featured: false
date: 2025-08-28
image: "../../assets/projects/secure-login-portal.webp"
imageAlt: "Login form for the Firebase-backed portal"
---

## Overview

My first project where the front end talked to a real backend. Firebase handled authentication and the database, which let me focus on the part I wanted to learn: what happens between a user typing a password and the app trusting them.

It taught me more about error handling than anything I had built before. The happy path took an afternoon; the wrong-password, network-dropped, and already-registered paths took considerably longer.
