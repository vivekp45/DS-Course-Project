#include <bits/stdc++.h>
using namespace std;

/* ==== Short DSA-Based Algebraic Expression Solver ==== */
/* DSA Concepts: Stack, Queue, Linked List, Sorting, Searching */

struct Node { char expr[100]; double result; Node* next; }; 
Node* history = NULL; // Linked list for history

void addHistory(const char* e, double r){
    Node* n = new Node; strcpy(n->expr,e); n->result=r; n->next=history; history=n;
}
void showHistory(){
    cout << "\n--- Recent Results ---\n";
    for(Node* p=history; p; p=p->next) cout << p->expr << " = " << p->result << "\n";
}

/* ---------- Stack for expression ---------- */
struct Stack { double a[100]; int top=-1; };
void push(Stack &s,double x){ s.a[++s.top]=x; }
double pop(Stack &s){ return s.a[s.top--]; }

/* ---------- Queue demo ---------- */
queue<string> taskQ;

/* ---------- Expression Solver (infix → postfix → eval) ---------- */
int prec(char c){ if(c=='^')return 3; if(c=='*'||c=='/')return 2; if(c=='+'||c=='-')return 1; return 0; }

string infixToPostfix(string inf){
    string out; stack<char> st;
    for(char c: inf){
        if(isalnum(c)||c=='.') out+=c;
        else if(c=='(') st.push(c);
        else if(c==')'){ while(!st.empty()&&st.top()!='('){ out+=' '; out+=st.top(); st.pop(); } st.pop(); }
        else if(strchr("+-*/^",c)){
            out+=' ';
            while(!st.empty() && prec(st.top())>=prec(c)){ out+=st.top(); out+=' '; st.pop(); }
            st.push(c);
        }
        else if(c==' ') out+=' ';
    }
    while(!st.empty()){ out+=' '; out+=st.top(); st.pop(); }
    return out;
}

double evalPostfix(string pf){
    Stack st; stringstream ss(pf); string tok;
    while(ss >> tok){
        if(isdigit(tok[0]) || (tok.size()>1 && tok[0]=='-' && isdigit(tok[1]))){
            push(st, stod(tok));
        } else {
            double b=pop(st), a=pop(st);
            if(tok=="+") push(st,a+b);
            else if(tok=="-") push(st,a-b);
            else if(tok=="*") push(st,a*b);
            else if(tok=="/") push(st,a/b);
            else if(tok=="^") push(st,pow(a,b));
        }
    }
    return pop(st);
}

/* ---------- Polynomial (Quadratic only) ---------- */
void solveQuadratic(){
    double a,b,c;
    cout<<"Enter coefficients a b c: "; cin>>a>>b>>c;
    double d=b*b-4*a*c;
    if(d<0) cout<<"No real roots\n";
    else{
        double r1=(-b+sqrt(d))/(2*a), r2=(-b-sqrt(d))/(2*a);
        cout<<"Roots: "<<r1<<", "<<r2<<"\n";
    }
}

/* ---------- 2x2 Linear Equation Solver ---------- */
void solveLinear2(){
    double a1,b1,c1,a2,b2,c2;
    cout<<"Enter eq1: a1 b1 c1: "; cin>>a1>>b1>>c1;
    cout<<"Enter eq2: a2 b2 c2: "; cin>>a2>>b2>>c2;
    double det=a1*b2-a2*b1;
    if(fabs(det)<1e-9) cout<<"No unique solution\n";
    else{
        double x=(c1*b2-c2*b1)/det;
        double y=(a1*c2-a2*c1)/det;
        cout<<"x="<<x<<", y="<<y<<"\n";
    }
}

/* ---------- Sorting & Searching ---------- */
void demoSortSearch(){
    string arr[5]={"delta","alpha","echo","bravo","charlie"};
    cout<<"\nBefore sort: "; for(string s:arr) cout<<s<<" ";
    for(int i=0;i<5;i++)for(int j=0;j<4-i;j++)
        if(arr[j]>arr[j+1]) swap(arr[j],arr[j+1]);
    cout<<"\nAfter bubble sort: "; for(string s:arr) cout<<s<<" ";
    string key; cout<<"\nSearch word: "; cin>>key;
    int f=-1; for(int i=0;i<5;i++) if(arr[i]==key) f=i;
    cout<<(f!=-1?"Found\n":"Not Found\n");
}

/* ---------- Main Menu ---------- */
int main(){
    int ch;
    taskQ.push("Expression"); taskQ.push("Quadratic"); taskQ.push("Linear");
    while(true){
        cout<<"\n=== Algebraic Expression Solver (Mini DSA Project) ===\n";
        cout<<"1. Expression Solver\n2. Quadratic Roots\n3. Solve Linear (x,y)\n4. Sort & Search Demo\n5. Show History\n0. Exit\nChoice: ";
        cin>>ch;
        if(ch==0) break;
        if(ch==1){
            string expr; cout<<"Enter infix expr (numbers only): ";
            cin.ignore(); getline(cin,expr);
            string pf=infixToPostfix(expr);
            cout<<"Postfix: "<<pf<<"\n";
            double res=evalPostfix(pf);
            cout<<"Result: "<<res<<"\n";
            addHistory(expr.c_str(),res);
        } else if(ch==2) solveQuadratic();
        else if(ch==3) solveLinear2();
        else if(ch==4) demoSortSearch();
        else if(ch==5) showHistory();
        else cout<<"Invalid\n";
    }
    cout<<"\nQueue demo: Remaining jobs = "<<taskQ.size()<<"\n";
    return 0;
}
