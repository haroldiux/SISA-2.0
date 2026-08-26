package bo.edu.unitepc.sisa.builder;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * SEA Single Resource Response Envelope Builder.
 *
 * @param <T> Payload Data Type
 * @author GentleAI SISA Architecture Team
 */
public class ResourceBuilder<T> {

    private T data;
    private String message = "Success";
    private int status = 200;
    private final Map<String, Object> meta = new HashMap<>();

    public static <T> ResourceBuilder<T> of(T data) {
        ResourceBuilder<T> builder = new ResourceBuilder<>();
        builder.data = data;
        builder.meta.put("timestamp", Instant.now().toString());
        return builder;
    }

    public ResourceBuilder<T> message(String message) {
        this.message = message;
        return this;
    }

    public ResourceBuilder<T> status(int status) {
        this.status = status;
        return this;
    }

    public ResourceBuilder<T> addMeta(String key, Object value) {
        this.meta.put(key, value);
        return this;
    }

    public Map<String, Object> build() {
        Map<String, Object> envelope = new HashMap<>();
        envelope.put("status", this.status);
        envelope.put("message", this.message);
        envelope.put("data", this.data);
        envelope.put("meta", this.meta);
        return envelope;
    }
}
