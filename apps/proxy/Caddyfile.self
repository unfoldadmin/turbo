(rueliq_proxy) {
	request_body {
		max_size {$FILE_SIZE_LIMIT:25MB}
	}

	# Backend API
    # LangGraph chat endpoint должен идти в langgraph-api
    reverse_proxy /api/chat*  langgraph-api:8080
	reverse_proxy /api/auth/* web:3000
	reverse_proxy /api/copilotkit/* web:3000
	reverse_proxy /api/*  api:8000
	reverse_proxy /auth/* api:8000
	reverse_proxy /admin/* api:8000
	reverse_proxy /static/* api:8000

	# Frontend (Next.js)
	reverse_proxy /*      web:3000
}

{
	servers {
		max_header_size 25MB
		client_ip_headers X-Forwarded-For X-Real-IP
		trusted_proxies static {$TRUSTED_PROXIES:0.0.0.0/0}
	}
}

{$SITE_ADDRESS} {
	import rueliq_proxy
	# self-signed через встроенный CA
	tls internal
}
