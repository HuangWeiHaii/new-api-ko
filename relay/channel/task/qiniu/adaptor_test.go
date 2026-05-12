package qiniu

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	relaycommon "github.com/QuantumNous/new-api/relay/common"
)

func TestBuildRequestURLUsesQiniuVideoEndpoint(t *testing.T) {
	adaptor := &TaskAdaptor{}
	info := &relaycommon.RelayInfo{
		ChannelMeta: &relaycommon.ChannelMeta{
			ChannelBaseUrl: "https://api.qnaigc.com",
		},
	}
	adaptor.Init(info)

	got, err := adaptor.BuildRequestURL(info)
	if err != nil {
		t.Fatalf("BuildRequestURL returned error: %v", err)
	}

	want := "https://api.qnaigc.com/v3/contents/generations/tasks"
	if got != want {
		t.Fatalf("BuildRequestURL = %q, want %q", got, want)
	}
}

func TestFetchTaskUsesQiniuVideoEndpoint(t *testing.T) {
	var gotMethod, gotPath, gotAuth string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotAuth = r.Header.Get("Authorization")
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, `{"id":"qvideo-task"}`)
	}))
	defer server.Close()

	adaptor := &TaskAdaptor{}
	resp, err := adaptor.FetchTask(server.URL, "secret", map[string]any{
		"task_id": "qvideo-task",
	}, "")
	if err != nil {
		t.Fatalf("FetchTask returned error: %v", err)
	}
	defer resp.Body.Close()

	if gotMethod != http.MethodGet {
		t.Fatalf("method = %q, want %q", gotMethod, http.MethodGet)
	}
	wantPath := "/v3/contents/generations/tasks/qvideo-task"
	if gotPath != wantPath {
		t.Fatalf("path = %q, want %q", gotPath, wantPath)
	}
	if gotAuth != "Bearer secret" {
		t.Fatalf("Authorization = %q, want %q", gotAuth, "Bearer secret")
	}
}
