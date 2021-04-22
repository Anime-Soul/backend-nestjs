import { Request, Response } from 'express';
import { fail } from './common/util/res.wrap';
import * as fetch from 'node-fetch';

const wasm = async (req: Request, res: Response) => {
  const u = req.body?.url as string;

  if (!u) return res.send(fail('url  should not be empty'));

  // https://quan.qq.com/video/1098_ec1274dbc22bb62acece60ac54257a5d
  const [content, tag] = u.split('@');
  let url = content;
  const type = content.includes('m3u8') ? 'hls' : 'mp4';
  const code = 200;
  switch (tag) {
    case '1096':
      const vid = await fetch(
        `https://www.wegame.com.cn/api/forum/lua/wegame_feeds/get_feed_item_data?p={"iid":"${content}","uid":211762212}`,
      )
        .then((resp) => resp.json())
        .then((data) => JSON.parse(data.data.data.data).video.vid);

      const _res = await fetch(
        `https://qt.qq.com/php_cgi/cod_video/php/get_video_url.php?json=1&multirate=1&filetype=40&game_id=123456&vid=${vid}`,
      )
        .then((resp) => resp.json())
        .then((data) => data.data[0].data[0]);

      const sha = _res.replace(/(\S*)1096/, '');
      url =
        `https://apd-vliveachy.apdcdn.tc.qq.com/vwegame.tc.qq.com/1096` + sha;

      return res.send({ code, data: { url, type: 'mp4' } });
    case '1072':
      url = await fetch(
        `https://api.pengyou.com/go-cgi-bin/moment_h5/getFeedDetail?feedId=${content}`,
      )
        .then((resp) => resp.json())
        .then((data) => data.result.contents[0].video.urls.f0);
      return res.send({ code, data: { url, type: 'mp4' } });
    case 'weibo':
      url = await fetch(`https://m.weibo.cn/statuses/show?id=${content}`)
        .then((resp) => resp.json())
        .then((data) =>
          data.data.page_info.urls.mp4_720p_mp4.replace('http', 'https'),
        );

      return res.send({ code, data: { url, type: 'mp4' } });
    default:
      // 时光的处理
      if (content.includes('1098')) {
        const _res: string = await fetch(content)
          .then((resp) => resp.url)
          .then((data) => data);
        const sha = _res.replace(/(\S*)1098/, '');
        url =
          `https://apd-vliveachy.apdcdn.tc.qq.com/vmtt.tc.qq.com/1098` + sha;
        return res.send({ code, data: { url, type } });
      } else if (content.includes('xiaohongshu')) {
        //上限 15 分钟
        fetch(content)
          .then((_) => _.text())
          .then((_) => {
            const [, , url] = /<video(.*?)src\="(.*?)"/.exec(_);
            url.replace('amp;', '');
            res.send({ code, data: { url, type } });
          });
      }
      return res.send({ code, data: { url, type } });
  }
};

export default wasm;

/**
 *
const tepl = () =>
  fetch('http://localhost:4000/wasm', {
    method: 'post',
    body: JSON.stringify({
      url:
        'https://gss3.baidu.com/6LZ0ej3k1Qd3ote6lo7D0j9wehsv/tieba-smallvideo/607272_7339acc31054e8a970606b4e70e49c21.mp4?t=1600786454478',
    }),
    headers: {
      'content-type': 'application/json',
    },
    mode: 'cors',
    credentials: 'include',
  })
    .then((_) => _.json())
    .then((_) => {
      console.log(_)
    })
 *
 *
 */

// case 'hcy':
//   const info = atob(content).split(',');
//   url = `https://caiyun.feixin.10086.cn/webdisk2/downLoadAction!downloadToPC.action?contentID=${info[1]}&shareContentIDs=${info[1]}&catalogList=&downloadSize=214446914`;
//   const cookie: string = await fetch(
//     `https://api.clicli.us/cookie/${info[0]}`,
//   )
//     .then((resp) => resp.json())
//     .then((data) => data.result.hcy);
//   url = await fetch(url, {
//     headers: {
//       Cookie: cookie,
//       Host: 'caiyun.feixin.10086.cn',
//     },
//   })
//     .then((resp) => resp.json())
//     .then((data) => data.downloadUrl);
//   return res.send({ code, data: { url, type: 'mp4' } });
