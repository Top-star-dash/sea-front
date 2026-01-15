import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

// 受保护的路由（需要登录）
const protectedRoutes = ['/dashboard', '/admin', '/profile'];
// 需要 ADMIN 角色的路由
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
   const path = request.nextUrl.pathname;

   if (path === 'login' || path === '/api') {
      return NextResponse.next();
   }

   const accessToken = request.cookies.get('access_token')?.value;

   // 情况 1：有 Access Token
   if (accessToken) {
      try {
         const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as {
            username: string;
            role: string;
            exp: number;
         };

         // 检查是否过期
         if (Date.now() >= payload.exp * 1000) {
            throw new Error('Token expired');
         }

         // 检查 ADMIN 路由权限
         if (adminRoutes.some((route) => path.startsWith(route))) {
            if (payload.role !== 'ADMIN') {
               return NextResponse.redirect(new URL('/403', request.url));
            }
         }

         return NextResponse.next();
      } catch (e) {
         // Token 无效或过期 → 尝试刷新
      }
   }
   // 情况 2：尝试刷新 Token
   const refreshToken = request.cookies.get('refresh_token')?.value;
   if (refreshToken) {
      try {
         // 验证 refresh token 是否有效（可选）
         jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

         // 调用 refresh 接口
         const refreshRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/auth/refresh`,
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
      }
   }

   // 未认证 → 跳转登录
   return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
   matcher: [...protectedRoutes,...adminRoutes],
};