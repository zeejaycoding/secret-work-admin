import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import {
  ArrowLeft,
  DollarSign,
  Users,
  CreditCard,
  Check,
  Pencil,
} from "lucide-react";

import { getPlanDetail } from "../services/api";

export default function PlanDetailPage() {
  const navigate = useNavigate();
  const { key } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getPlanDetail(key)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [key]);

  const plan = data?.plan;

  const stats = [
    {
      title: "Price",
      value: loading ? "—" : plan?.price?.label ?? "—",
      icon: DollarSign,
    },
    {
      title: "Active Users",
      value: loading ? "—" : plan?.activeUsers?.toLocaleString() ?? "—",
      icon: Users,
    },
    {
      title: "Revenue",
      value: loading ? "—" : `$${(plan?.revenue ?? 0).toLocaleString()}`,
      icon: CreditCard,
    },
  ];

  return (
    <Box>
      {/* Breadcrumb */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 4,
          cursor: "pointer",
        }}
        onClick={() => navigate("/subscriptions")}
      >
        <ArrowLeft size={20} color="#929292" />

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#929292",
          }}
        >
          Subscriptions
        </Typography>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#4A4A4A",
          }}
        >
          /
        </Typography>

        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "13px",
            color: "#FFFFFF",
          }}
        >
          {loading ? "…" : plan?.label || "Plan"}
        </Typography>
      </Box>

      {/* Heading + Edit */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: { xs: 3, md: 4 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "18px", sm: "20px", md: "24px" },
              color: "#FFFFFF",
              mb: 0.5,
            }}
          >
            {loading ? "…" : plan?.label || "Plan"}
          </Typography>

          <Typography
            sx={{
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: { xs: "12px", md: "13px" },
              color: "#6B6B6B",
            }}
          >
            Pricing, benefits and revenue.
          </Typography>
        </Box>

        <Button
          startIcon={<Pencil size={16} color="#FFFFFF" />}
          onClick={() => navigate(`/plan/${key}/edit`)}
          sx={{
            bgcolor: "#1F1F1F",
            border: "1px solid #2A2A2A",
            borderRadius: "10px",
            color: "#D6D6D6",
            textTransform: "none",
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "12px",
            px: 2.5,
            py: 1,
            flexShrink: 0,

            "&:hover": {
              bgcolor: "#1F1F1F",
              borderColor: "#3A3A3A",
            },
          }}
        >
          Edit Plan
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: { xs: 1.5, md: 2 },
          maxWidth: 900,
        }}
      >
        {stats.map((item, i) => {
          const Icon = loading ? CreditCard : item.icon;

          return (
            <Box
              key={i}
              sx={{
                bgcolor: "#161616",
                borderRadius: "10px",
                boxShadow: "0px 4px 20px #00000066",
                p: 2.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "#929292",
                    mb: 1,
                  }}
                >
                  {loading ? "—" : item.title}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 500,
                    fontSize: "24px",
                    color: "#FFFFFF",
                    mb: 1,
                  }}
                >
                  {loading ? "—" : item.value}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={28} color="#484848" />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Benefits */}
      <Box
        sx={{
          mt: 4,
          bgcolor: "#161616",
          border: "1px solid #1F1F1F",
          borderRadius: "10px",
          boxShadow: "0px 4px 20px #00000066",
          p: 3,
          maxWidth: 900,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontWeight: 500,
            fontSize: "16px",
            color: "#FFFFFF",
            mb: 3,
          }}
        >
          Benefits
        </Typography>

        {loading ? (
          <Box
            sx={{
              py: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: "#E50914" }} />
            <Typography
              sx={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "14px",
                color: "#929292",
              }}
            >
              Loading plan...
            </Typography>
          </Box>
        ) : !plan || !plan.benefits?.length ? (
          <Typography
            sx={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              color: "#929292",
              textAlign: "center",
              py: 4,
            }}
          >
            No benefits found
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {plan.benefits
              .filter((b) => b.enabled !== false)
              .map((b, i) => (
                <Box
                  key={i}
                  sx={{
                    bgcolor: "#1F1F1F",
                    border: "1px solid #2A2A2A",
                    borderRadius: "10px",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "#E50914",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "Poppins",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "#FFFFFF",
                    }}
                  >
                    {b.text || b.benefit || b.name || b}
                  </Typography>
                </Box>
              ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
