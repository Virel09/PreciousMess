// functions/api/redroom.js
export async function onRequest(context) {
  const { request, env } = context;

  // 处理跨域 CORS (让留言板/子域名能顺利访问)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // 获取数据 (GET)
  if (request.method === 'GET') {
    try {
      // 读取点赞数
      let likes = await env.GUESTBOOK_KV.get('redroom_likes');
      likes = likes ? parseInt(likes) : 0;

      // 读取弹幕列表
      let chats = await env.GUESTBOOK_KV.get('redroom_chats');
      chats = chats ? JSON.parse(chats) : [];

      return new Response(JSON.stringify({ success: true, likes, chats }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: '读取失败: ' + err.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  // 写入数据 (POST)
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { action, name, content } = body;

      // 点赞操作
      if (action === 'like') {
        let likes = await env.GUESTBOOK_KV.get('redroom_likes');
        likes = likes ? parseInt(likes) + 1 : 1;
        await env.GUESTBOOK_KV.put('redroom_likes', likes.toString());
        return new Response(JSON.stringify({ success: true, likes }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 发送弹幕操作
      if (action === 'chat') {
        if (!content) {
          return new Response(JSON.stringify({ error: '内容不能为空' }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        // 读取现有弹幕并追加
        let chats = await env.GUESTBOOK_KV.get('redroom_chats');
        chats = chats ? JSON.parse(chats) : [];
        chats.push({ name: name || '匿名', content });
        await env.GUESTBOOK_KV.put('redroom_chats', JSON.stringify(chats));

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      return new Response(JSON.stringify({ error: '未知操作' }), { status: 400 });
    } catch (err) {
      return new Response(JSON.stringify({ error: '服务器错误: ' + err.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
