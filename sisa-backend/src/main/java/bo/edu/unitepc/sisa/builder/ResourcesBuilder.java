package bo.edu.unitepc.sisa.builder;

import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * SEA Collection Resources Response Envelope Builder.
 *
 * @param <T> Payload Element Type
 * @author GentleAI SISA Architecture Team
 */
public class ResourcesBuilder<T> {

    private Collection<T> data;
    private String message = "Success";
    private int status = 200;
    private int total = 0;
    private final Map<String, Object> meta = new HashMap<>();

    public static <T> ResourcesBuilder<T> of(Collection<T> data) {
        ResourcesBuilder<T> builder = new ResourcesBuilder<>();
        builder.data = data;
        builder.total = (data != null) ? data.size() : 0;
        builder.meta.put("timestamp", Instant.now().toString());
        return builder;
    }

    public ResourcesBuilder<T> message(String message) {
        this.message = message;
        return this;
    }

    public ResourcesBuilder<T> status(int status) {
        this.status = status;
        return this;
    }

    public ResourcesBuilder<T> total(int total) {
        this.total = total;
        return this;
    }

    public ResourcesBuilder<T> addMeta(String key, Object value) {
        this.meta.put(key, value);
        return this;
    }

    public Map<String, Object> build() {
        Map<String, Object> envelope = new HashMap<>();
        envelope.put("status", this.status);
        envelope.put("message", this.message);
        envelope.put("data", this.data);
        envelope.put("total", this.total);
        envelope.put("meta", this.meta);
        return envelope;
    }
}
