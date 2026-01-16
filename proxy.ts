import { NextRequest, NextResponse } from "next/server";
// if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
//    throw new Error('JWT secrets are missing in environment variables');
// }
// 受保护的路由（需要登录）
const protectedRoutes = ['/dashboard', '/admin', '/profile'];
// 需要 ADMIN 角色的路由
const adminRoutes = ['/admin'];

const PUBLIC_PATHS = ['/login', '/register', '/api'];

export async function proxy(request: NextRequest) {
   const path = request.nextUrl.pathname;


   // 1. 公共路径直接放行
   if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
      return NextResponse.next();
   }
   const accessToken = request.cookies.get('access_token')?.value;
   // 情况 1：有 Access Token
   if (accessToken) {
      try {
         const res = await fetch('http://localhost:3002/auth/profile', {
            headers: { Cookie: request.headers.get('cookie') || '' },
            credentials: 'include',
         })
         const data = await res.json();
         if (res.ok) {
            const { role } = data;
            // 3. 检查是否访问了 ADMIN 专属路由
            if (adminRoutes.some(route => path.startsWith(route))) {
               if (role !== 'TEST_ADMIN') {
                  console.log(`User with role ${role} denied access to ${path}`);
                  return NextResponse.redirect(new URL('/login', request.url));
               }
            }
            return NextResponse.next();
         } else {
            console.log("error token")
         }
      } catch (e) {
         console.log("err: ", e)
      }
   }
   // 情况 2：尝试刷新 Token
   const refreshToken = request.cookies.get('refresh_token')?.value;
   if (refreshToken) {
      try {
         // 调用 refresh 接口
         const refreshRes = await fetch(
            `http://localhost:3002/auth/refresh`,
            {
               method: 'POST',
               headers: { Cookie: request.headers.get('cookie') || '' },
               credentials: 'include',
            }
         );
         if (refreshRes.ok) {
            // 刷新成功，重试原请求
            const response = NextResponse.next();
            // 合并新 Cookie（从 refresh 响应中提取）
            const setCookieHeaders = refreshRes.headers.get('set-cookie');
            if (setCookieHeaders) {
               setCookieHeaders.split(',').forEach((cookie) => {
                  response.headers.append('set-cookie', cookie.trim());
               });
            }
            return response;
         }
      } catch (e) {
         // 刷新失败
         console.log("err: ",e)
      }
   }

   // 未认证 → 跳转登录
   return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
   matcher: [
      '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)',
   ],
};