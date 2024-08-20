# 빠르게 재배포
docker-compose build
docker-compose push
kubectl rollout restart deployment hangulpangpang-frontend-deployment -n dev 