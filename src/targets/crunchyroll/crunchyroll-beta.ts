
// todo: impl using https://github.com/crunchy-labs/crunchy-cli/blob/master/crunchyroll.go as ref

// needs to have the etp_rt cookie set, for this, we need to authenticate
export const getToken = () =>
  fetch(`https://beta-api.crunchyroll.com/auth/v1/token`, {
    method: 'POST',
    headers: {
        Authorization: 'Basic bm9haWhkZXZtXzZpeWcwYThsMHE6',
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({grant_type: 'etp_rt_cookie'})
  }).then(res => res.json()).then(res => res.data.session_id)


export const search = () => {
  // const payload = {'session_id' : sessionId, 'media_type' : 'anime', 'fields':'series.url,series.series_id','limit':'1500','filter':'prefix:the-devil'}
  // fetch(`https://beta-api.crunchyroll.com/content/v1/search?session_id=${sessionId}&q=the devil`)
}
