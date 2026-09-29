export function installEvidence(page) {
  const context = page.context();
  if (context.__workshopUiDemoEvidence) throw new Error('Browser evidence collector is already installed.');
  const state = { console: [], requests: [], pages: [] };
  const pages = new Map();
  const requests = new Map();
  function pageId(value) {
    if (!value) return null;
    if (!pages.has(value)) {
      pages.set(value, state.pages.length);
      state.pages.push({ id: state.pages.length, url: value.url() });
    }
    const id = pages.get(value);
    state.pages[id].url = value.url();
    return id;
  }
  function requestEntry(request) {
    if (!requests.has(request)) {
      let source;
      try { source = request.frame().page(); } catch {}
      const entry = { page: pageId(source), url: request.url(), method: request.method(),
        resourceType: request.resourceType(), at: Date.now(), status: null };
      requests.set(request, entry);
      state.requests.push(entry);
    }
    return requests.get(request);
  }
  context.__workshopUiDemoEvidence = { state, pageId };
  context.pages().forEach(pageId);
  context.on('page', pageId);
  context.on('console', message => state.console.push({
    page: pageId(message.page()), type: message.type(), text: message.text(),
    location: message.location(), at: Date.now(),
  }));
  context.on('weberror', error => state.console.push({
    page: pageId(error.page()), type: 'pageerror', text: error.error().message,
    stack: error.error().stack, at: Date.now(),
  }));
  context.on('request', requestEntry);
  context.on('response', response => Object.assign(requestEntry(response.request()), {
    status: response.status(), statusText: response.statusText(),
  }));
  context.on('requestfailed', request => {
    requestEntry(request).failure = request.failure()?.errorText ?? 'Request failed';
  });
  return { installed: true };
}

export function readEvidence(page) {
  const evidence = page.context().__workshopUiDemoEvidence;
  if (!evidence) throw new Error('Browser evidence collector is unavailable.');
  return evidence.state;
}

export function currentPage(page) {
  const evidence = page.context().__workshopUiDemoEvidence;
  if (!evidence) throw new Error('Browser evidence collector is unavailable.');
  return { page: evidence.pageId(page) };
}

export async function stopTabVideo(page, index) {
  const target = index === null ? page : page.context().pages()[index];
  if (!target) throw new Error('Tab index is unavailable.');
  await target.screencast.stop();
}
