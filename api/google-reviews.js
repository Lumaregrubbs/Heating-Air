const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "s-maxage=21600, stale-while-revalidate=86400"
};

function send(res, statusCode, payload) {
  res.statusCode = statusCode;
  Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
}

function cleanReview(review) {
  return {
    authorName: review.author_name || "Google reviewer",
    rating: Number(review.rating || 0),
    relativeTime: review.relative_time_description || "",
    text: review.text || ""
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, {
      success: false,
      message: "Method not allowed."
    });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Add these as Vercel environment variables. Never hard-code the Google API key in the website.
  if (!apiKey || !placeId) {
    return send(res, 503, {
      success: false,
      configured: false,
      message: "Google reviews need GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID."
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,rating,user_ratings_total,reviews,url");
  url.searchParams.set("key", apiKey);

  try {
    const googleResponse = await fetch(url);
    const data = await googleResponse.json();

    if (!googleResponse.ok || data.status !== "OK") {
      return send(res, 502, {
        success: false,
        configured: true,
        message: data.error_message || `Google Places returned ${data.status || "an error"}.`
      });
    }

    const result = data.result || {};

    return send(res, 200, {
      success: true,
      configured: true,
      name: result.name || "Always Heating and Air",
      rating: Number(result.rating || 0),
      totalReviews: Number(result.user_ratings_total || 0),
      googleUrl: result.url || "",
      reviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
      reviews: Array.isArray(result.reviews) ? result.reviews.slice(0, 3).map(cleanReview) : []
    });
  } catch (error) {
    return send(res, 500, {
      success: false,
      configured: true,
      message: "Google reviews could not be loaded right now."
    });
  }
};
