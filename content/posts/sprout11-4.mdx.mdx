---
title: "[題解]NEOJ 739 芽芽逛大街"
date: 2021-1-10
tags: 
    - 資訊之芽
    - 題解
categories: 資芽題解
mathjax: true
---
### 芽芽逛大街
<!--more-->
[題目連結](https://neoj.sprout.tw/problem/739/)
有向無環圖的 case → DAG 最長路徑!
將每個強連通元件縮成點後，因為內部的點可以一直亂走全部走到，所以只要將新點的點權更新成內部所有點的點權總和，得到一張新的有向無環圖，就可以直接做 DAG 最長路徑得到答案。

```cpp=
#include <bits/stdc++.h>
#define int long long
#define ios ios::sync_with_stdio(0),cin.tie(0);
#define N 500002
using namespace std;
int n,m,dfn[N],low[N],es = 1,stk_in[N],vertex_val[N],deg[N];
//dfn為時間戳記,low為back, cross edge（經過最多一次）到達最小點dfn,stk_in是否在stack內
bool visit[N];
int scc[N],scc_ind = 0,scc_val[N];//紀錄屬於哪個scc,scc編號,scc編號的價值（權重和）
int topological_order[N],ind = 0;

struct edg{
    int to;
    int val;
};

vector<edg> edge[N],new_edge[N];
stack<int> s;

void DFS(int now){
    dfn[now] = low[now] = es++;
    s.push(now);
    stk_in[now] = 1;
    visit[now] = 1;
    int len = edge[now].size();
    for(int i=0;i<len;i++){
        int next = edge[now][i].to;
        if(!visit[next]){       //尚未拜訪則拜訪
            DFS(next);
            low[now] = min(low[now],low[next]);
        }
        else if(stk_in[next]){  //在stk內且已拜訪->同屬一個SCC
            low[now] = min(low[now],dfn[next]);
            //這條邊指向還沒出stack的點，可為cross or back edge 更新low[now]
        }
    }
    //如果是scc就pop stack裡面的東西
    if(low[now] == dfn[now]){
        stk_in[now] = 0;        //pop出stack裡面
        scc[now] = ++scc_ind;   //進行SCC編號
        scc_val[scc_ind] = vertex_val[now]; //更新點權
        while(s.top()!=now){                //pop直到now被找到
            scc[s.top()] = scc_ind;
            stk_in[s.top()] = 0;            //pop出來
            scc_val[scc_ind] += vertex_val[s.top()];
            s.pop();
        }
        s.pop();//將stack 中now也pop
    }
}

signed main(){
    ios;
    cin>>n>>m;
    memset(visit, 0, sizeof(visit));
    memset(stk_in, 0, sizeof(stk_in));
    memset(deg, 0, sizeof(deg));
    for(int i=1;i<=n;i++){
        int x;cin>>x;
        vertex_val[i] = x;
    }
    for(int i=0;i<m;i++){
        int x,y,val;cin>>x>>y>>val;//x指向y
        edge[x].push_back( edg{y,val} );
    }
    for(int i=1;i<=n;i++)
        if(!visit[i])DFS(i);
    
    //枚舉每一條邊更新邊權
    for(int i=1;i<=n;i++){
        int len = edge[i].size();
        for(int j=0;j<len;j++){
            int to = edge[i][j].to;
            if(scc[to]==scc[i]){
                int ind = scc[to];
                scc_val[ind]+=edge[i][j].val;
            }
            else{   //不同SCC指向不同的邊
                new_edge[scc[i]].push_back( edg{scc[to],edge[i][j].val});
                deg[scc[to]]++;
            }
        }
    }
    
    //Topological sort
    queue<int> q;
    
    for(int i=1;i<=scc_ind;i++)
        if(deg[i]==0)q.push(i);

    while(!q.empty()){
        int now = q.front(),len = new_edge[now].size();
        topological_order[ind++] = now;
        q.pop();
        for(int i=0;i<len;i++){
            int next = new_edge[now][i].to;
            if(--deg[next]==0)q.push(next);
        }
    }
    
    //拓墣排序完進行DP找最長路徑
    int dp[ind],ans = 0;
    for(int i=1;i<=scc_ind;i++){
        dp[i] = scc_val[i];
        ans = max(ans, scc_val[i]);
    }
    
    for(int i=0;i<ind;i++){
        int now = topological_order[i],len = new_edge[now].size();
        for(int j=0;j<len;j++){
            int next = new_edge[now][j].to;
            dp[next] = max(dp[next],scc_val[next]+dp[now]+new_edge[now][j].val);
            ans = max(ans, dp[next]);
        }
    }
    cout<<ans<<endl;
}
```
