import * as mysql from 'mysql2';

const cliConn = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'clicli',
});

const DMConn = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'nest-dm',
});

const defaultCover =
  'https://wx4.sinaimg.cn/mw690/0060lm7Tly1fvmtrka9p5j30b40b43yo.jpg';

const mresult = {
  post: { done: 0, count: 0 },
  video: { done: 0, count: 0 },
  error: {
    errorPost: {
      errCount: 0,
    },
    errorVideo: {
      errCount: 0,
    },
  },
};

const migratPost = () =>
  new Promise((_) => {
    DMConn.query('DELETE  FROM post', () => {
      DMConn.query(
        'insert into user set id=?, username=?, email=?, roleLevel=?, avatar=?, password=?;',
        [1, 'No.1', 'email', 0, defaultCover, '1'],
        () => {
          cliConn.query<any[]>(
            'SELECT * FROM `posts` ORDER BY id',
            function (_err, results) {
              console.log(results.length);

              mresult.post.count = results.length;
              results.map((post, i) => {
                const { title, content, id } = post;

                const _cover = /\[suo\]\((.*?)\)/.exec(content);
                let cover: string;
                if (_cover) cover = _cover[1];
                else cover = defaultCover;

                DMConn.query(
                  'insert into post set title=?, content=?, cover=?, id=?, creatorId=?;',
                  [title, content, cover, id, '1'],
                  (e: any) => {
                    if (e) {
                      if (mresult.error.errorPost[e.errno])
                        mresult.error.errorPost[e.errno].push(id);
                      else mresult.error.errorPost[e.errno] = [id];

                      mresult.error.errorPost.errCount += 1;
                    } else {
                      mresult.post.done++;
                      console.log(
                        `已插入 ${mresult.post.done} 條數據， POSTID: ${id} ，共 ${results.length} 條`,
                      );
                    }

                    if (i >= results.length - 1) _('post');
                  },
                );
              });
            },
          );
        },
      );
    });
  });

const migratVideo = () =>
  new Promise((_) => {
    DMConn.query('DELETE FROM video', () => {
      cliConn.query<any[]>(
        'SELECT * FROM `videos` ORDER BY id',
        function (_err, results) {
          mresult.video.count = results.length;
          results.map((video, i) => {
            const { id, oid, title, content, pid } = video;

            DMConn.query(
              'insert into video set title=?, subtitle=?, id=?, playUrl=?, episode=?, bindPostId=?, cover=? ;',
              [title, title, id, content, oid, pid, defaultCover],
              (e: any) => {
                if (e) {
                  if (mresult.error.errorVideo[e.errno])
                    mresult.error.errorVideo[e.errno].push(id);
                  else mresult.error.errorVideo[e.errno] = [id];

                  mresult.error.errorVideo.errCount += 1;
                } else {
                  mresult.video.done++;
                  console.log(
                    `已插入 ${mresult.video.done} 條數據， VIDEOID: ${id} POSTID: ${pid}，共 ${results.length} 條`,
                  );
                }

                if (i >= results.length - 1) _('video');
              },
            );
          });
        },
      );
    });
  });

migratPost().then(() => {
  migratVideo().then(() => {
    console.log(mresult);
  });
});
