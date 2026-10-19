# Browsers for the keyboard layout tests (playwright.layouts.config.ts).
# A virtual X display runs Playwright's browser server, so real key presses
# from xdotool go through the xkb keyboard layout before a browser sees them.
# The Playwright version must match @playwright/test in e2e/package.json.
FROM mcr.microsoft.com/playwright:v1.63.0-noble
RUN apt-get update \
  && apt-get install -y --no-install-recommends xvfb xdotool x11-xkb-utils xkb-data \
  && rm -rf /var/lib/apt/lists/*
COPY tanstack.xkb /usr/share/X11/xkb/symbols/tanstack
WORKDIR /server
RUN npm init -y >/dev/null && npm install --no-audit --no-fund playwright@1.63.0 >/dev/null
ENV DISPLAY=:99
EXPOSE 3000
CMD ["sh", "-c", "Xvfb :99 -screen 0 1280x800x24 -nolisten tcp & exec npx playwright run-server --port 3000 --host 0.0.0.0"]
