package relay

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"
	taskqiniu "github.com/QuantumNous/new-api/relay/channel/task/qiniu"
)

func TestGetTaskAdaptorReturnsQiniuVideoAdaptor(t *testing.T) {
	adaptor := GetTaskAdaptor(constant.TaskPlatform("58"))
	if _, ok := adaptor.(*taskqiniu.TaskAdaptor); !ok {
		t.Fatalf("GetTaskAdaptor(58) = %T, want *qiniu.TaskAdaptor", adaptor)
	}
}
