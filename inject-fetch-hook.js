(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
  
      try {
        const req = args[0];
        const url = typeof req === 'string' ? req : req.url;
  
        if (url.includes("graphql?opname=MotusPlayers")) {
          const clone = response.clone();
          const json = await clone.json();
  
          const map = {};
          json.data?.motusPlayers?.forEach(p => {
            map[p.name?.trim()] = p._id;
          });
  
          window.__tusmoPlayers = map;
          console.log("Tusmo player map captured:", map);
        }
      } catch (e) {
        console.warn("Tusmo fetch hook error:", e);
      }
  
      return response;
    };
  })();  