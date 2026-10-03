using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ERPSolution.Json
{
    public sealed class FlexibleNullableNumberConverterFactory : JsonConverterFactory
    {
        private static readonly Type[] SupportedTypes =
        {
            typeof(byte), typeof(sbyte), typeof(short), typeof(ushort),
            typeof(int), typeof(uint), typeof(long), typeof(ulong),
            typeof(float), typeof(double), typeof(decimal)
        };

        public override bool CanConvert(Type typeToConvert)
        {
            Type valueType = Nullable.GetUnderlyingType(typeToConvert);
            if (valueType == null)
            {
                return false;
            }

            foreach (Type type in SupportedTypes)
            {
                if (type == valueType)
                {
                    return true;
                }
            }

            return false;
        }

        public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
        {
            Type valueType = Nullable.GetUnderlyingType(typeToConvert);
            Type converterType = typeof(Converter<>).MakeGenericType(valueType);
            return (JsonConverter)Activator.CreateInstance(converterType);
        }

        private sealed class Converter<T> : JsonConverter<T?> where T : struct
        {
            public override T? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            {
                if (reader.TokenType == JsonTokenType.Null)
                {
                    return null;
                }

                if (reader.TokenType == JsonTokenType.String)
                {
                    string text = reader.GetString();
                    if (string.IsNullOrWhiteSpace(text))
                    {
                        return null;
                    }

                    return (T)Convert.ChangeType(text, typeof(T), CultureInfo.InvariantCulture);
                }

                return JsonSerializer.Deserialize<T>(ref reader, options);
            }

            public override void Write(Utf8JsonWriter writer, T? value, JsonSerializerOptions options)
            {
                if (!value.HasValue)
                {
                    writer.WriteNullValue();
                    return;
                }

                JsonSerializer.Serialize(writer, value.Value, options);
            }
        }
    }
}