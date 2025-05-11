---
title: 資芽第九週：動態規劃（三）
date: 2021-5-8
tags: 
    - 資芽筆記
    - 動態規劃
    - DP
categories: 資訊之芽筆記
mathjax: true
#password: sprout2022
---

## 上課內容

首先是影片的重點整理，主題是DP優化：

DP優化

- 矩陣快速冪優化
  - 費氏數列：O(n)->O(logN)
  - DC
  - 把很大的n做矩陣快速冪降到logN
<!--more-->
- 狀態壓縮
  - TSP旅行銷售員問題
  - 權重最小的漢米頓迴路
  - 暴力做：n個點、n-1點、...、1個點
  - 暴力複雜度：O(N!)
  - 使用位元紀錄
  - DP[n][s]用s的二進位第i位表示是否去過該城市
  - 複雜度：轉移$O(N)\times O(N\times 2^N)=O(n^2\times 2^n)$

- 資料結構優化（單調隊列優化）
  - 開一個新的dpMAX，O(n^2)->O(n)
  - 不大於K，用heap來O(nlogn)維護遞增的固定區間最大值
  - 方法三：用Deque實作，O(n)
  - I<j，dp[i]>dp[j] 具有單調性（單調遞減）

- 円円開店
  - dp[n] = val[n]+max(dp[i]-c(n-i)),n-k≤i≤n-1
  - O(NK)->O(N)使用單調隊列優化
  - 令t[I] = dp[i]+c*i

- 有限背包問題優化
  - 分推湊出每一種重量
  - 如何分推：二進位 ${1,2,4,8,...,2^p,q}$，使 $2^{p+1}-1$ 不大於k[i]的最大整數
  - 原O(NWK) -> O(NW*logK)
  - 利用單調隊列優化：O(NW)!!!

## 上機作業

### 円円賣漢堡

[題目連結](https://neoj.sprout.tw/problem/188/)
首先在做任何優化之前，都必須先列出定義與轉移式。

#### 定義

定義$dp[i]$為在第1到i個點開店，且第i個點有開店時的最大盈利

#### 轉移式

$dp[i] = val[i]+max(dp[j]-c(i-j)),i-k≤j≤i-1$

#### 邊界

$dp[i] = 0, 1≤i≤n$

做完以上的定義與轉移式之後，可以得到複雜度：$O(NK)$就可以得到以下的結果：
![](https://i.imgur.com/Z4OaqJJ.png)
試著利用**單調隊列優化**，把複雜度降到$O(N)$
利用單調隊列可以確保所有的數字都只會被push與pop一次，因此總複雜度為$O(n)$
![](https://i.imgur.com/hn2Px6s.png)
差一個K時間就差很多！

具體的作法如下，因為我們要維護的單調隊列的dp後面有一些東西，因此我們要做一些調整，把有i的提出來（不然當i不一樣的時候就很難處理）

$$\begin{split}dp[i] &= val[i]+max(dp[j]-c(i-j)),i-k≤j≤i-1\\&=val[i]-ci+max(dp[j]+cj)\end{split}$$

這時候令 $t[j] = dp[j]+cj$，可以把加上 $cj$ 想像成跟頭的距離（跟當前的 $-ci$ 合在一起就是我們要的距離），則 $max(t[j]),i-k≤j≤i-1$ 就可以使用單調隊列優化！

{% note info %}
**單調隊列優化**

單調隊列優化名稱的由來是因為維護的容器具有單調性（在這裡用到的是單調遞減），這一次嘗試的是用deque<pair<int,int>>來實作，第一維是裝t[i]，第二維是裝i。以下是具體的實作步驟：

1. 將單調隊列中<font color="#f00">過時的</font>（也就是距離大於K的）pop出來，讓容器中的元素都是可以被取到的狀態
2. 更新 $dp[n]$ 的值，利用容器最前面的元素（就是最大的by單調性）來更新。要注意到，元素最前面固然是最大，但也可能會比什麼都不取還差，要特別注意！
3. 從容器的後面更新，把小於接下來要放入的值的元素都pop出來，以維持單調遞減的特性！
4. 將當前的 $t[n]$ 給push進去！結束！

如果要維護dp[n]的單調性，會保證若 $i<j$，則 $dp[i]>dp[j]$；因為如果$dp[i]≤dp[j]$，那第i個永遠不會被取到（因為要求的區間是不斷往後的，若一個數字在前面又比後面的數字小，永遠就不會被取到！）
{% endnote %}

以下是程式碼的部分，其中第21到24行為單調隊列優化的部分：

```cpp=
#include <bits/stdc++.h>
#define int ll
#define ll long long
#define mod 1000000007
#define FOR(i,n) for(int i=0;i<n;i++)
#define ios ios::sync_with_stdio(0)
using namespace std;
int t;

void solve(){
    int n,k,c,val[100005];cin>>n>>k>>c;
    for(int i=1;i<=n;i++)cin>>val[i];
    
    int dp[100005];
    memset(dp,0,sizeof(dp));
    deque<pair<int,int>> deq;
    
    deq.push_back(make_pair(val[1]+c,1));    //這個小細節差點沒有注意到，要加上c
    dp[1] = val[1];
    for(int i=2;i<=n;i++){
        while(!deq.empty() && deq.front().second < i-k)deq.pop_front();
        dp[i] = val[i]-c*i+max(c*i,deq.front().first);
        while(!deq.empty() && deq.back().first <= dp[i]+c*i)deq.pop_back();
        deq.push_back(make_pair(dp[i]+c*i,i));
    }
    int ans = 0;
    for(int i=1;i<=n;i++)ans = max(ans,dp[i]);
    cout<<ans<<endl;
}

signed main(){
    ios;
    cin>>t;
    while(t--){
        solve();
    }
}
```

### 高棕櫚觀光農場：旅行銷售員問題TSP

[題目連結](https://neoj.sprout.tw/problem/187/)
第一次寫**TSP**(Traveling Salesman Problem)，題目敘述如下：
> 給定一系列城市和每對城市之間的距離，求解存取每一座城市一次並回到起始城市的最短迴路。

這是一個已經被證明$NP-Hard$ 的問題，暴力作法是要檢查所有路徑的情況，因為共有n個點，每一個點又連接n-1個點，繼續下去總共會有N!種情況，因此複雜度為$O(n!)$。
總共的點數共有n個，根據多邊形的邊數公式可以知道一共有$\frac{n^2-n}{2}$條邊，每一條邊都有各自的距離。
如果改用DP做，時間複雜度可以壓到時間複雜度$O(n^2\cdot2^n)$，比$O(n!)$還優秀！這一題用到的是DP優化中的<font color="#f00">狀態壓縮</font>，具體的實作細節如下：

{% note success %}

**位元運算**
在這一題需要用到位元運算，用16個bit表示每一個點有沒有被走訪過。用這樣的表示方法可以讓code更為節儉，也就是狀態壓縮的概念。

**左移運算子(<<)**
這一題會一直反覆被用到，1<<t代表把1往左移動t單位，用10進位表示就是$2^t$。每往左移動一格，數字就會變成原來的兩倍！

**狀態壓縮**
將十進位整數s以二進位表示，會得到一串01字串，假設s=10，則 $s = 1010_{(2)}$。以這題來說，這樣的字串我們可以用來表示第4和第2個點已經被拜訪，而第3跟第1個點還沒有被拜訪。
{% endnote %}

#### 定義

定義 $dp[n][s]$ 表示目前在第n點上，s為走過的點（狀態壓縮）的最短距離

#### 轉移式

$dp[n][s] = min(dp[i][s-(1<<n)]+dis[i][n])$, for all i such that s&(1<<i)!=0

這個轉移式很有意思，因為s代表了每一個點是否有被走過，當我要更新dp[n][s]時，我要確保此時的狀態s中的點n必須為1。同時，因為1<<i用二進位表示只有第i位會是1其他都是0，做and運算就看s的第i位決定結果。

對於每一個i必須確保第i點在狀態s中有被造訪，因此有了後面的條件。另外轉移式中的s-(1<<N)是把第n個點從未造訪的狀態轉移。

#### 邊界

$dp[0][1] = 0,\quad dp[i][j]= \infty$

距離的預設狀態為無限大，第一個點的初始狀態是最短距離0

#### 實作小細節

**迴圈順序**
在轉移的過程中，迴圈的第一層必須是狀態，第二層才是城市。如果顛倒過來的話，會導致前面的城市在狀態還沒有被更新的時候就已經失去了之後被更新的機會，因此城市的迴圈必須放在第二層！

**求答案**
因為我們要求的是回到原點的最短距離，因此在全部轉移完成之後，利用一個迴圈把回去原點的路的距離加上去，求得最小值。

```cpp=
#include <bits/stdc++.h>
#define N 16
#define mod 1000000007
#define FOR(i,n) for(int i=0;i<n;i++)
#define ios ios::sync_with_stdio(0)
using namespace std;
int t;

void solve(){
    int n,dis[20][20];cin>>n;
    memset(dis,0,sizeof(dis));
    
    for(int i=0;i<n-1;i++){
        for(int j=i+1;j<n;j++){
            cin>>dis[i][j];
            dis[j][i] = dis[i][j];
        }
    }
    
    int dp[N][66000],m = 1<<n;
    memset(dp,0x3f3f3f3f,sizeof(dp));
    dp[0][1] = 0;   //將0點到自己的距離設為1
    
    //O(n^2 2^n)
    for(int i=0;i<m;i++){            //i表示2^n每一種狀態
        for(int j=0;j<n;j++){        //j表示城市
            if(!(i&(1<<j)))continue; //j城市要是被造訪過的狀態
            for(int k=0;k<n;k++){    //可以到的所有點中的狀態
                if(i & 1<<k){        //確保轉移過去的有被造訪過
                    dp[j][i] = min(dp[j][i],dp[k][i-(1<<j)]+dis[j][k]);
                }
            }
        }
    }
    int ans = INT_MAX;
    for(int i=0;i<n;i++)ans = min(ans,dp[i][m-1]+dis[i][0]);
    cout<<ans<<endl;
}

int main(){
    ios;
    cin>>t;
    while(t--){
        solve();
    }
}
```

### 憤怒的小鳥

[題目連結](https://neoj.sprout.tw/problem/255/)
[Submission](https://neoj.sprout.tw/challenge/177536/)
玩憤怒鳥遊戲的概念，給定二維平面上n個點代表n個豬（皆在第一象限），這時候可以從原點(0,0)的位置發射軌跡為拋物線的小鳥，打到豬豬後並不會改變飛行的軌跡，題目想要問最少要發射幾個小鳥才能射下所有的豬豬？

> 範例測資
> 7
> 1 3
> 2 4
> 3 3
> 2 6
> 4 8
> 1 1
> 1 2

如果畫在圖上就長這樣：
![](https://i.imgur.com/cCEHouc.png)

如果把拋物線畫出來就像這樣：
![](https://i.imgur.com/u63WTC6.png)

因為$n\le24$，所以可以知道這一題可能只能把所有情況都掃一遍（~~才不是因為剛好講狀態壓縮XD~~）

**作法1：** 時間複雜度$O(n^2\cdot 2^n)$
我們可以利用一個二維陣列g[i][j]表示經過i豬和j豬與原點所形成的拋物線所能經過的所有點的狀態。這樣我們可以利用$O(n^3)$的時間完成預處理，知道一條由i豬和j豬形成的拋物線能經過的點的狀態（用二進位表示），在dp轉移的時候則需枚舉所有的i和j，所需時間是$n^2$。
轉移式的話一開始是寫用推的：$dp[s|g[i][j]] = min(dp[s]+1)$，比較直覺一點。

**作法2：** 時間複雜度$O(n\cdot 2^n)$
當我們在做狀態s的時候，如果是上面的方法就是$n^2$掃過所有的點的組合，其實我們可以只要找到s其中一位第k位是1的，因為那一位所對應到的豬豬一定會經過，所以就可以針對那一位做轉移，如此一來跟k同在一個拋物線的最多只會有n個，複雜度就降到了$O(n\cdot 2^n)$。這裡可以搭配一個vector<int>line[N]裝每一位有經過的可能的狀態。

#### 定義

$dp[s]$為狀態為s的時候的最小拋物線數量

#### 轉移式

$dp[s]=min(dp[s\&(\sim mask)]+1)$

這個轉移式挺有趣的，我們知道如果要從狀態p得到狀態s，對於s是0的bit，p也應該是0；對於s是1的bit，若mask是1，則p的bit要是0，反之則是1。

```flow
st=>start: for each bit p in s
sub1=>subroutine: My Subroutine
cond=>condition: if p=1
e=>operation: set dp[i] to 0
io=>condition: if mask[i]=1
ss=>operation: set dp[i] to 1
sp1=>operation: set dp[i] to 0
sp2=>operation: set dp[i] to 1

st->cond->io
cond(yes)->io->e
cond(no)->e

io(yes)->sp1
io(no)->sp2
```

這個轉移式可以有另外一個表示的方式，可以達到同樣的效果：
$dp[s]=min(dp[s\&(i\oplus mask)]+1)$

#### 邊界

$for\ each\ dp[i]=0$

以下程式碼是以$O(n^3)$的預處理，$O(n\cdot 2^n)$的轉移，因此總時間複雜度是$O(2^n)$，在時限內是可以過的！
![](https://i.imgur.com/j8uRDfj.png)

> [time=Thu, Sep 16, 2021 3:03 PM]更新

結果呢，有人問了我這一題，我回去看我的code，結果發現明明應該是 $O(n\cdot 2^n)$ 轉移，但每一個line_mask中在worst case卻有 $n^2$ 個狀態，這樣子下來一樣還是 $O(n^2\cdot 2^n)$ 沒有進步。發現問題在於，當全部的點都在同一條拋物線上的時候，會有重複的狀態被push很多次的問題，所以只要用visit去紀錄這種狀態是否出現過，讓最多被推入一次就好!

![](https://i.imgur.com/V2ubK6i.png)

```cpp=
#include <bits/stdc++.h>
#define long long ll
#define N 24
#define mod 1000000007
#define FOR(i,n) for(int i=0;i<n;i++)
using namespace std;
int t,n,x[N],y[N];

void solve(){
    vector<int>line_mask[N];
    scanf("%d",&n);
    for(int i = 0;i < n;i++)scanf("%d %d",&x[i],&y[i]);
    int m = 1<<n,dp[m];
    bool visit[m];memset(visit,0,sizeof(visit));
    //calculate all lines O(n^3)
    for(int i=0;i<n;i++){
        line_mask[i].push_back(1<<i);       //有可能此點孤立一人，要確保也在裡面
        for(int j=i+1;j<n;j++){
            int x1 = x[i],y1 = y[i];
            int x2 = x[j],y2 = y[j];
            if(x1==x2)continue;

            double a = (double)((x1*y2)-(x2*y1))/(x1*x2*(x2-x1));
            double b = (double)(y1-a*x1*x1)/x1;
            if(a >= 0)continue;

            int mask1 = 1<<i|1<<j;
            for(int k = 0;k < n;k++){
                if(fabs((double)a*x[k]*x[k]+b*x[k]-y[k])<=1e-6)mask1|=(1<<k);
            }
            if(visit[mask1])continue;
            for(int k = 0;k < n;k++){
                if((mask1>>k) & 1)line_mask[k].push_back(mask1);
            }
            visit[mask1] = 1;
            //過k點的所有經過的點的狀態
        }
    }
    memset(dp,0x3f3f3f,sizeof(dp));
    dp[0] = 0;

    //O(n 2^n轉移)
    for(int s = 1;s < m;s++){
        int cur = __lg(s),len = line_mask[cur].size();
        for(int i = 0;i < len;i++){
            int mk = line_mask[cur][i];
            dp[s] = min(dp[s], dp[(s&(~mk))] + 1);
            if(dp[s] == 1)break;
        }
    }
    printf("%d\n",dp[m-1]);
}

int main(){
    scanf("%d",&t);
    while(t--){
        solve();
    }
}
```

### 硬幣問題

[題目連結](https://neoj.sprout.tw/problem/159/)

有點訝異，原本想說把code丟上去測一下，看看能過前面幾筆測資，結果卻直接全部過了！我也沒有做什麼特別的DP優化，丟上去卻直接Accept了！這題跟原本的硬幣問題有些許的不同，在於他有限制每一種硬幣的數量，面額為 $C_i$ 的硬幣共有 $K_i$ 個，也就是要問你能否用這些固定數量的硬幣湊出特定的面額。

我們可以討論不同的面額的餘數，時間複雜度分析估計約為：$O(N\times C_i\times \frac{M}{C_i})=O(NM)$，照理來說因為要執行t次，算下來有可能會TLE，不過這一題沒有卡就是了。

```cpp=
#include <bits/stdc++.h>
#define N 105
#define mod 1000000007
#define FOR(i,n) for(int i=0;i<n;i++)
#define ios ios::sync_with_stdio(0)
using namespace std;
int t;

void solve(){
    int n,m,val[N],num[N];cin>>n>>m;
    for(int i=0;i<n;i++)cin>>val[i]>>num[i];
    
    bool dp[20005];
    memset(dp,0,sizeof(dp));
    dp[0] = 1;
    
    for(int i=0;i<n;i++){
        for(int k=0;k<val[i];k++){
            int left = num[i];
            for(int j=k+val[i];j<=m;j+=val[i]){
                if(dp[j]!=0)left = num[i];
                else if(left>0 && dp[j-val[i]]){
                    left--;
                    dp[j] = 1;
                }
            }
        }
    }
    if(dp[m]==1)cout<<"Yes"<<endl;
    else cout<<"No"<<endl;
}

int main(){
    ios;
    cin>>t;
    while(t--){
        solve();
    }
}
```

### 烏龜疊疊樂---易

[題目連結](https://neoj.sprout.tw/problem/185/)
這題簡單來說，是給定一個數列，要嘗試分配成好幾堆，每一堆的數量不超過k個。其中第i堆的總和乘上(i-1)，算出來的總和要最小。由題目敘述可以知道，每一堆到後面乘上的數字是越來越大，也就是被加上的次數會越來越多，如果我們將數列倒過來dp會比正面做來得容易維護。

{% note success %}

**轉移式**
dp[i] = max(dp[j]+pref[j]),for i-k≤j≤i-1，pref是維護已經反序過後的數列之前綴和。以範測為例，當k=2時，dp[i]可以選擇的就是從dp[i-1]跟dp[i-2]轉移，如果選擇dp[i-2]就表示第i項會和第i-1項合併成一堆，加上pref[i-2]也就是把前面的每一堆的數量乘上的數字都加一，也就是加上一個前綴和（由於每一個數字只會被合併一次）

**小證明：每一個數字只會被合併一次**
在轉移的過程中，有沒有可能會發生dp[i]要轉移的對象是dp[i-2]，但dp[i-1]卻已經被融合過了，造成三個烏龜融合在一起的情況？

也就是下圖這一種情況，dp[i-1]、dp[i-2]合併，dp[i]、dp[i-1]合併，變成三個融合超過k的情況（dp[i-2],dp[i-1],dp[i]合併）。
![](https://i.imgur.com/3NufpZ9.png)
答案：不會

首先先從dp[i-3]轉移的dp[i-1]表示第i-2跟i-1是合併成一堆，接下來的dp[i]從dp[i-2]轉移，加上了pref[i-2]，也就是把i-2獨立出去，i跟i-1合併成一堆，因此不會有大於k個烏龜合併在一起的情況。
{% endnote %}

這一題的轉移式不好想，要把東西反序之後比較好dp，轉移式也比較好寫出來！觀察到越後面的數字被重複加的機會比較大（高度越高），因此將數列的順續顛倒搭配前綴和就能比較方便的轉移！

#### 定義

$dp[i]$定義為使用1到i個烏龜，違和度的最大值

#### 轉移式

$dp[i] = max(dp[j]+pref[j]),for\ i-k≤j≤i-1$
這個轉移式是建立在順序顛倒的情況，在輸入的時候順便把逆序。

#### 邊界

$for\ each\ dp[i] = 0$

```cpp=
#include <bits/stdc++.h>
#define int long long
#define N 500005
#define ios ios::sync_with_stdio(0)
#define FOR(i,n) for(int i=0;i<n;i++)
using namespace std;
int n,k,arr[N],pref[N];

signed main(){
    ios;
    cin>>n>>k;
    for(int i=n;i>0;i--)cin>>arr[i];
    for(int i=1;i<=n;i++)pref[i] = pref[i-1]+arr[i];
    
    int dp[N];
    memset(dp,0,sizeof(dp));
    
    deque<pair<int,int>> deq;
    deq.push_back(make_pair(0,0));
    
    for(int i=1;i<=n;i++){
        while(!deq.empty() && deq.front().second<i-k)deq.pop_front();
        dp[i] = deq.front().first;
        while(!deq.empty() && deq.back().first <= dp[i]+pref[i])deq.pop_back();
        deq.push_back(make_pair(dp[i]+pref[i],i));
    }
    cout<<dp[n]<<endl;
}
```

## 手寫作業

這一週的主題是NP問題以及SAT，證明好難、數學好難！
