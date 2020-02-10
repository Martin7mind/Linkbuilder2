import _ from "lodash";
import build from "build-url";

export const getUniversalLink = (tracker, deeplink, androidLink, webLink) => {
  return `https://${tracker}.adj.st/${deeplink}?adjust_deeplink=${androidLink}&fallback=${webLink}`;
};

export const getAndroidLink = (deeplink, tracker) =>
  `sevenmind://${deeplink}?adjust_t=${tracker}`;

export const getClickTrackerLink = universalOrWebLink => {
  const javaScriptUniversalLink = encodeURIComponent(
    `https://app.adjust.com/jsr?url=${universalOrWebLink}`
  );

  return `https://tracking.7mind.de/redirect?uri=${javaScriptUniversalLink}`;
};

export const buildUrl = (url, params) => {
  const queryParams = _.pickBy(params);
  return _.isEmpty(queryParams) ? url : build(url, { queryParams });
}

