import { Callout, Metrics } from "@/components/mdx/blocks";
import { getEurosatMetrics } from "@/lib/eurosat";

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/** Results pulled from content/generated/eurosat-metrics.json (written by ml/eurosat/train.py). */
export function EurosatResults() {
  const m = getEurosatMetrics();
  if (!m) {
    return (
      <Callout title="Results pending">
        <p>
          Numbers appear here automatically after the training run. They come straight from the evaluation script, and
          none are typed in by hand.
        </p>
      </Callout>
    );
  }

  const perClass = m.classes.map((c, i) => ({ name: m.display[i], acc: m.per_class_acc_int8[c] })).sort((a, b) => a.acc - b.acc);

  return (
    <div className="space-y-8">
      <Metrics
        items={[
          { label: "Test accuracy (int8)", value: pct(m.test_acc_int8_onnx) },
          { label: "Model size", value: `${m.size_mb_int8} MB` },
          { label: "CPU latency", value: `${m.cpu_ms_int8.toFixed(0)} ms` },
        ]}
      />
      <table>
        <thead>
          <tr>
            <th>Variant</th>
            <th>Test accuracy</th>
            <th>Size</th>
            <th>CPU latency</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PyTorch (bf16 autocast)</td>
            <td>{pct(m.test_acc_torch)}</td>
            <td>—</td>
            <td>—</td>
          </tr>
          <tr>
            <td>ONNX fp32</td>
            <td>{pct(m.test_acc_fp32_onnx)}</td>
            <td>{m.size_mb_fp32} MB</td>
            <td>{m.cpu_ms_fp32.toFixed(1)} ms</td>
          </tr>
          <tr>
            <td>ONNX int8 (shipped)</td>
            <td>{pct(m.test_acc_int8_onnx)}</td>
            <td>{m.size_mb_int8} MB</td>
            <td>{m.cpu_ms_int8.toFixed(1)} ms</td>
          </tr>
        </tbody>
      </table>
      <div>
        <p className="label-mono mb-3">Per-class accuracy (int8, weakest first)</p>
        <ul className="space-y-2">
          {perClass.map((c) => (
            <li key={c.name} className="grid grid-cols-[10rem_1fr_3.5rem] items-center gap-3 text-sm">
              <span>{c.name}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-border">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${c.acc * 100}%` }} />
              </span>
              <span className="text-right font-mono text-xs text-muted">{pct(c.acc)}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="font-mono text-xs text-muted">
        {m.epochs} epochs · {m.train_minutes} min on {m.device} · split {m.split.train.toLocaleString()} /{" "}
        {m.split.val.toLocaleString()} / {m.split.test.toLocaleString()}
      </p>
    </div>
  );
}
