#include <stdio.h>
int main() { int a = ({ int _t; printf("Prompt:"); scanf("%d", &_t); _t; }); return 0; }
