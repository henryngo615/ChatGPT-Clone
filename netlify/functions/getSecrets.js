exports.handler = async (event, context) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        key: process.env.REACT_APP_NETLIFY_API_KEY // Key is now hidden from frontend
      })
    };
  };    