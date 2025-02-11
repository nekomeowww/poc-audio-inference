package operator

import (
	"context"

	"sigs.k8s.io/controller-runtime/pkg/client"
)

type baseClientContextKey string

const (
	defaultBaseClientContextKey baseClientContextKey = "default"
)

func NewClientContextKey(key string) baseClientContextKey {
	return baseClientContextKey(key)
}

func WithClient(ctx context.Context, client client.Client, key ...baseClientContextKey) context.Context {
	if len(key) == 0 {
		return context.WithValue(ctx, defaultBaseClientContextKey, client)
	}

	return context.WithValue(ctx, key[0], client)
}

func ClientFromContext(ctx context.Context, key ...baseClientContextKey) client.Client {
	if len(key) == 0 {
		c, _ := ctx.Value(defaultBaseClientContextKey).(client.Client)
		return c
	}

	c, _ := ctx.Value(key[0]).(client.Client)

	return c
}
