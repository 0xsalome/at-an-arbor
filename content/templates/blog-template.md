---
title: "<% tp.file.title %>"
date: <% tp.date.now("YYYY-MM-DD") %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm") %>
type: <% await tp.system.suggester(["blog", "essay"], ["blog", "essay"]) %>
---
